import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }

    // Parse request body
    const { url } = await req.json();

    if (!url) {
      throw new Error("Payment link URL is required");
    }

    // Validate URL format
    if (!url.includes('buy.stripe.com') && !url.includes('checkout.stripe.com')) {
      throw new Error("Invalid Stripe payment link URL");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Extract payment link ID from URL
    let paymentLinkId;
    try {
      if (url.includes('buy.stripe.com')) {
        // Format: https://buy.stripe.com/test_xxxxx or https://buy.stripe.com/xxxxx
        const parts = url.split('/');
        paymentLinkId = parts[parts.length - 1];
        // Remove query parameters if any
        paymentLinkId = paymentLinkId.split('?')[0];
      } else if (url.includes('checkout.stripe.com')) {
        // Handle checkout.stripe.com URLs if needed
        throw new Error("Checkout session URLs are not supported for import. Please use payment link URLs from buy.stripe.com");
      }

      if (!paymentLinkId) {
        throw new Error("Could not extract payment link ID from URL");
      }

      // Retrieve payment link details from Stripe
      const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);
      
      // Get the line item details
      const lineItem = paymentLink.line_items?.data?.[0];
      const price = lineItem?.price;

      return new Response(
        JSON.stringify({
          id: paymentLink.id,
          title: price?.product?.name || paymentLink.metadata?.title || 'Imported Payment Link',
          description: price?.product?.description || paymentLink.metadata?.description || '',
          amount: price?.unit_amount || 0,
          currency: price?.currency || 'usd',
          active: paymentLink.active,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error("Stripe API error:", stripeError);
      throw new Error(`Failed to retrieve payment link details: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Error importing payment link:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});