
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

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    logStep("Payment session retrieved", { 
      status: session.payment_status, 
      metadata: session.metadata,
      mode: session.mode 
    });
    
    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      const productId = session.metadata?.product_id;
      const productName = session.metadata?.product_name;
      
      logStep("Payment confirmed as paid", { userId, productId, productName, mode: session.mode });
      
      if (userId && userId !== "guest") {
        // Get user email for subscriber record
        const { data: profile, error: profileError } = await supabaseService
          .from("profiles")
          .select("email")
          .eq("user_id", userId)
          .single();

        if (profileError) {
          logStep("Error fetching user profile", { error: profileError });
        }

        const userEmail = profile?.email;
        
        // Get or create Stripe customer
        let stripeCustomerId = session.customer as string;
        
        if (!stripeCustomerId && userEmail) {
          const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
          if (customers.data.length > 0) {
            stripeCustomerId = customers.data[0].id;
          }
        }

        logStep("Customer ID determined", { stripeCustomerId });

        // Determine subscription tier and end date based on payment mode
        let subscriptionTier: string;
        let subscriptionEnd: string;
        
        if (session.mode === "payment") {
          // One-time payment
          subscriptionTier = "once off";
          // Set subscription end to one month from now
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          subscriptionEnd = endDate.toISOString();
        } else {
          // Subscription payment
          subscriptionTier = productName || "Basic";
          // For subscriptions, set end date to next day (will be updated by subscription hooks)
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 1);
          subscriptionEnd = endDate.toISOString();
        }

        logStep("Subscription details determined", { 
          subscriptionTier, 
          subscriptionEnd, 
          mode: session.mode 
        });

        // Update subscribers table
        if (userEmail) {
          const { error: subscriberError } = await supabaseService
            .from("subscribers")
            .upsert({
              user_id: userId,
              email: userEmail,
              stripe_customer_id: stripeCustomerId,
              subscribed: true,
              subscription_tier: subscriptionTier,
              subscription_end: subscriptionEnd,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });

          if (subscriberError) {
            logStep("Error updating subscriber", { error: subscriberError });
          } else {
            logStep("Subscriber updated successfully", { 
              email: userEmail, 
              tier: subscriptionTier,
              end: subscriptionEnd 
            });
          }
        }

        // Update profiles table with stripe_customer_id and allocate product if specified
        const profileUpdates: any = {};
        
        if (stripeCustomerId) {
          // Check if customer_id field exists in profiles, if not we'll skip this update
          try {
            await supabaseService
              .from("profiles")
              .update({ stripe_customer_id: stripeCustomerId })
              .eq("user_id", userId);
            logStep("Profile updated with stripe_customer_id", { stripeCustomerId });
          } catch (error) {
            logStep("Note: stripe_customer_id field may not exist in profiles table", { error });
          }
        }

        // Allocate product if productId is provided and valid
        if (productId && productId !== "default_product") {
          logStep(`Allocating product ${productId} to user ${userId}`);
          
          const { error: allocationError } = await supabaseService.rpc('allocate_product_to_user', {
            target_user_id: userId,
            product_id: productId
          });
          
          if (allocationError) {
            logStep("Error allocating product to user", { error: allocationError });
          } else {
            logStep("Product successfully allocated to user", { userId, productId, productName });
          }
        }
        
        // Update order status to paid if order exists
        const { error: updateError } = await supabaseService
          .from("orders")
          .update({ status: "paid" })
          .eq("stripe_session_id", sessionId);
        
        if (updateError) {
          logStep("Error updating order status", { error: updateError });
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          status: "paid",
          allocated: true,
          productName: subscriptionTier,
          subscriptionTier: subscriptionTier,
          subscriptionEnd: subscriptionEnd
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("No user allocation needed - guest user");
        
        return new Response(JSON.stringify({ 
          success: true, 
          status: "paid",
          allocated: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      status: session.payment_status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Payment verification error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
