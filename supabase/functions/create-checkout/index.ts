
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { priceId, tier, currency = "bwp" } = await req.json();
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Define pricing based on tier and currency
    let unitAmount;
    let productName;
    
    switch (tier) {
      case 'basic':
        unitAmount = currency === "bwp" ? 1500 : 115; // P15.00 BWP or $1.15 USD
        productName = "Basic Monthly Subscription";
        break;
      case 'premium':
        unitAmount = currency === "bwp" ? 3000 : 230; // P30.00 BWP or $2.30 USD
        productName = "Premium Monthly Subscription";
        break;
      case 'enterprise':
        unitAmount = currency === "bwp" ? 7500 : 575; // P75.00 BWP or $5.75 USD
        productName = "Enterprise Monthly Subscription";
        break;
      default:
        throw new Error("Invalid subscription tier");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
        price_data: {
          currency: currency,
          product_data: { name: productName },
          unit_amount: unitAmount,
          recurring: { interval: "month" },
        },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
