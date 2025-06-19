
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const { priceId, successUrl, cancelUrl } = await req.json();
    
    if (!priceId) throw new Error("Price ID is required");
    
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Get the product ID from the price
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active) {
      throw new Error("Price is not active");
    }
    
    // Get product details from Supabase to find the product ID
    const { data: dbPrice, error: priceError } = await supabaseClient
      .from("subscription_prices")
      .select("product_id, subscription_products(id, name)")
      .eq("stripe_price_id", priceId)
      .single();

    if (priceError || !dbPrice) {
      logStep("Error finding product", { error: priceError });
      throw new Error("Product not found in database");
    }

    const productId = dbPrice.product_id;
    logStep("Found product", { productId, productName: (dbPrice as any).subscription_products?.name });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    const isOneTimePayment = !price.recurring;
    logStep("Price verified", { priceId, amount: price.unit_amount, currency: price.currency, isOneTime: isOneTimePayment });

    // Create checkout session with appropriate mode and metadata
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isOneTimePayment ? "payment" : "subscription",
      success_url: successUrl || `${req.headers.get("origin")}/live?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/subscription?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        user_id: user.id,
        product_id: productId,
        product_name: (dbPrice as any).subscription_products?.name || "Unknown Product"
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url, mode: sessionConfig.mode, metadata: sessionConfig.metadata });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
