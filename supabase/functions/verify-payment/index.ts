
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
      
      logStep("Payment confirmed as paid", { userId, productId, productName });
      
      if (userId && userId !== "guest" && productId && productId !== "default_product") {
        logStep(`Allocating product ${productId} to user ${userId}`);
        
        // Use the database function to allocate the product to the user
        const { error: allocationError } = await supabaseService.rpc('allocate_product_to_user', {
          target_user_id: userId,
          product_id: productId
        });
        
        if (allocationError) {
          logStep("Error allocating product to user", { error: allocationError });
        } else {
          logStep("Product successfully allocated to user", { userId, productId, productName });
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
          productName: productName
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("No product allocation needed - guest user or no product specified");
        
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
