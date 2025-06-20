
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment verification started");

    const { sessionId } = await req.json();
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription']
    });

    console.log("SESSSION", session);
    
    logStep("Retrieved checkout session", { 
      sessionId, 
      status: session.payment_status,
      mode: session.mode,
      customer: session.customer
    });

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ 
        success: false, 
        status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get customer details
    const customer = await stripe.customers.retrieve(session.customer as string);
    const customerEmail = (customer as any).email;
    
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    logStep("Found customer", { email: customerEmail });

    // Find user by email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id, email')
      .eq('email', customerEmail)
      .single();

    if (profileError || !profile) {
      logStep("User profile not found", { email: customerEmail, error: profileError });
      throw new Error("User profile not found");
    }

    logStep("Found user profile", { userId: profile.user_id });

    let productAllocated = false;
    let productName = "";

    if (session.mode === 'subscription' && session.subscription) {
      // Handle subscription - update subscribers table and allocate products
      const subscription = session.subscription as any;
      const priceId = session.line_items?.data[0]?.price?.id;
      
      if (priceId) {
        // Find the subscription product associated with this price
        const { data: subscriptionPrice } = await supabaseClient
          .from('subscription_prices')
          .select(`
            *,
            subscription_products!inner(*)
          `)
          .eq('stripe_price_id', priceId)
          .single();

        if (subscriptionPrice) {
      console.log('found subscription Price'), subscriptionPrice

          const product = (subscriptionPrice as any).subscription_products;
          productName = product.name;
          
          // Update subscribers table
          await supabaseClient.from('subscribers').upsert({
            user_id: profile.user_id,
            email: customerEmail,
            stripe_customer_id: session.customer,
            subscribed: true,
            subscription_tier: productName,
            subscription_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });

          // Allocate product to user
          const { error: allocateError } = await supabaseClient
            .rpc('allocate_product_to_user', {
              target_user_id: profile.user_id,
              product_id: product.id
            });

          if (!allocateError) {
            productAllocated = true;
            logStep("Product allocated to user", { 
              userId: profile.user_id, 
              productId: product.id,
              productName 
            });
          } else {
            console.log('failed')
            logStep("Failed to allocate product", { error: allocateError });
          }
        }
      }
    } else {
      // else if (session.mode === 'payment') {
      // Handle one-time payment
      console.log('were in else')
      const lineItem = session.line_items?.data[0];
      if (lineItem?.price?.metadata?.product_id) {
        const productId = lineItem.price.metadata.product_id;
        
        // Get product details
        const { data: product } = await supabaseClient
          .from('subscription_products')
          .select('*')
          .eq('id', productId)
          .single();

        if (product) {
      console.log('found product', product)

          productName = product.name;
          
          // Allocate product to user
          const { error: allocateError } = await supabaseClient
            .rpc('allocate_product_to_user', {
              target_user_id: profile.user_id,
              product_id: productId
            });

          if (!allocateError) {
            productAllocated = true;
            logStep("One-time product allocated to user", { 
              userId: profile.user_id, 
              productId,
              productName 
            });
          }
        }
      }
    }

    // Create order record
    await supabaseClient.from('orders').insert({
      user_id: profile.user_id,
      stripe_session_id: sessionId,
      amount: session.amount_total,
      currency: session.currency || 'usd',
      status: 'paid',
    });

    logStep("Payment verification completed", { 
      success: true, 
      allocated: productAllocated,
      productName 
    });

      console.log('paid')


    return new Response(JSON.stringify({ 
      success: true, 
      status: 'paid',
      allocated: productAllocated,
      productName: productName || "Subscription"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
      console.log('errored')

    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
