
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Payment session status:", session.payment_status);
    console.log("Session metadata:", session.metadata);
    
    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      const productId = session.metadata?.product_id;
      
      if (userId && userId !== "guest" && productId && productId !== "default_product") {
        console.log(`Allocating product ${productId} to user ${userId}`);
        
        // Use the database function to allocate the product to the user
        const { error: allocationError } = await supabaseService.rpc('allocate_product_to_user', {
          target_user_id: userId,
          product_id: productId
        });
        
        if (allocationError) {
          console.error("Error allocating product to user:", allocationError);
        } else {
          console.log("Product successfully allocated to user");
        }
      } else {
        console.log("No product allocation needed - guest user or no product specified");
      }
      
      // Update order status to paid
      const { error: updateError } = await supabaseService
        .from("orders")
        .update({ status: "paid" })
        .eq("stripe_session_id", sessionId);
      
      if (updateError) {
        console.error("Error updating order status:", updateError);
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        status: "paid",
        allocated: userId && userId !== "guest" && productId && productId !== "default_product"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      status: session.payment_status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
