
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
    
    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price', 'subscription', 'customer']
    });
    
    logStep("Retrieved checkout session", { 
      sessionId, 
      status: session.payment_status,
      mode: session.mode,
      customer: session.customer,
      customerEmail: session.customer_email,
      lineItemsCount: session.line_items?.data?.length || 0
    });

    if (session.payment_status !== 'paid') {
      logStep("Payment not completed", { status: session.payment_status });
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

    // Get customer email - try multiple sources
    let customerEmail = session.customer_email;
    if (!customerEmail && session.customer) {
      const customer = await stripe.customers.retrieve(session.customer as string);
      customerEmail = (customer as any).email;
    }
    
    if (!customerEmail) {
      logStep("ERROR: No customer email found", { 
        customerEmail: session.customer_email,
        customerId: session.customer 
      });
      throw new Error("Customer email not found");
    }

    logStep("Found customer email", { email: customerEmail });

    // Find user by email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id, email')
      .eq('email', customerEmail)
      .single();

    if (profileError || !profile) {
      logStep("ERROR: User profile not found", { 
        email: customerEmail, 
        error: profileError?.message 
      });
      throw new Error(`User profile not found for email: ${customerEmail}`);
    }

    logStep("Found user profile", { userId: profile.user_id });

    let productAllocated = false;
    let productName = "";
    let subscriptionUpdated = false;

    // Handle subscription mode
    if (session.mode === 'subscription' && session.subscription) {
      logStep("Processing subscription payment");
      
      const subscription = session.subscription as any;
      const lineItem = session.line_items?.data[0];
      const priceId = lineItem?.price?.id;
      
      logStep("Subscription details", {
        subscriptionId: subscription.id,
        priceId,
        currentPeriodEnd: subscription.current_period_end
      });

      if (priceId) {
        // Find the subscription product associated with this price
        const { data: subscriptionPrice, error: priceError } = await supabaseClient
          .from('subscription_prices')
          .select(`
            *,
            subscription_products!inner(*)
          `)
          .eq('stripe_price_id', priceId)
          .single();

        logStep("Price lookup result", { 
          found: !!subscriptionPrice, 
          error: priceError?.message 
        });

        if (subscriptionPrice && (subscriptionPrice as any).subscription_products) {
          const product = (subscriptionPrice as any).subscription_products;
          productName = product.name;
          
          logStep("Found subscription product", { 
            productId: product.id, 
            productName 
          });

          // Update subscribers table
          const subscriberUpdate = {
            user_id: profile.user_id,
            email: customerEmail,
            stripe_customer_id: session.customer,
            subscribed: true,
            subscription_tier: productName,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          };

          logStep("Updating subscribers table", subscriberUpdate);

          const { error: subscriberError } = await supabaseClient
            .from('subscribers')
            .upsert(subscriberUpdate, { onConflict: 'email' });

          if (subscriberError) {
            logStep("ERROR updating subscribers", { error: subscriberError.message });
          } else {
            logStep("Successfully updated subscribers table");
            subscriptionUpdated = true;
          }

          // Allocate product to user profile
          logStep("Allocating product to user", { 
            userId: profile.user_id, 
            productId: product.id 
          });

          const { error: allocateError } = await supabaseClient
            .rpc('allocate_product_to_user', {
              target_user_id: profile.user_id,
              product_id: product.id
            });

          if (allocateError) {
            logStep("ERROR allocating product", { error: allocateError.message });
          } else {
            logStep("Successfully allocated product to user");
            productAllocated = true;
          }
        } else {
          logStep("WARNING: No subscription product found for price", { priceId });
        }
      }
    } 
    // Handle one-time payment mode
    else if (session.mode === 'payment') {
      logStep("Processing one-time payment");
      
      const lineItem = session.line_items?.data[0];
      const priceId = lineItem?.price?.id;
      
      logStep("One-time payment details", { priceId });

      if (priceId) {
        // Check if this price has product metadata
        const price = await stripe.prices.retrieve(priceId);
        const productId = price.metadata?.product_id;
        
        logStep("Price metadata", { productId, metadata: price.metadata });

        if (productId) {
          // Get product details
          const { data: product, error: productError } = await supabaseClient
            .from('subscription_products')
            .select('*')
            .eq('id', productId)
            .single();

          if (product && !productError) {
            productName = product.name;
            
            logStep("Found one-time product", { 
              productId, 
              productName 
            });

            // Allocate product to user
            const { error: allocateError } = await supabaseClient
              .rpc('allocate_product_to_user', {
                target_user_id: profile.user_id,
                product_id: productId
              });

            if (allocateError) {
              logStep("ERROR allocating one-time product", { error: allocateError.message });
            } else {
              logStep("Successfully allocated one-time product");
              productAllocated = true;
            }
          } else {
            logStep("ERROR: Product not found", { productId, error: productError?.message });
          }
        } else {
          logStep("WARNING: No product_id in price metadata");
        }
      }
    }

    // Create order record
    const orderData = {
      user_id: profile.user_id,
      stripe_session_id: sessionId,
      amount: session.amount_total,
      currency: session.currency || 'usd',
      status: 'paid',
    };

    logStep("Creating order record", orderData);

    const { error: orderError } = await supabaseClient
      .from('orders')
      .insert(orderData);

    if (orderError) {
      logStep("ERROR creating order", { error: orderError.message });
    } else {
      logStep("Successfully created order record");
    }

    const result = {
      success: true,
      status: 'paid',
      allocated: productAllocated,
      subscriptionUpdated,
      productName: productName || "Purchase",
      userId: profile.user_id
    };

    logStep("Payment verification completed", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
