
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
    
    if (!priceId) {
      logStep("Error: Price ID is required");
      throw new Error("Price ID is required");
    }
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Error: No authorization header");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      logStep("Error: User not authenticated");
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Error: Stripe secret key not configured");
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the product ID from the price
    let price;
    try {
      price = await stripe.prices.retrieve(priceId);
      logStep("Price retrieved from Stripe", { priceId, amount: price.unit_amount, currency: price.currency });
    } catch (error) {
      logStep("Error retrieving price from Stripe", { priceId, error: error.message });
      throw new Error(`Invalid price ID: ${priceId}. Please check your Stripe configuration.`);
    }
    
    if (!price.active) {
      logStep("Error: Price is not active", { priceId });
      throw new Error("This price is not active in Stripe");
    }
    
    // First, let's check what prices exist in the database for debugging
    logStep("Checking all prices in database for debugging", { priceId });
    
    const { data: allPrices, error: allPricesError } = await supabaseClient
      .from("subscription_prices")
      .select("id, stripe_price_id, active, product_id");
    
    logStep("All prices in database", { allPrices, error: allPricesError });
    
    // Now let's specifically look for our price
    logStep("Looking up specific price in database", { priceId });
    
    const { data: dbPrices, error: priceError } = await supabaseClient
      .from("subscription_prices")
      .select(`
        id,
        product_id,
        stripe_price_id,
        active,
        subscription_products!inner(id, name)
      `)
      .eq("stripe_price_id", priceId);

    logStep("Database query result for specific price", { dbPrices, error: priceError });

    if (priceError) {
      logStep("Database query error", { error: priceError });
      throw new Error(`Database error: ${priceError.message}`);
    }

    if (!dbPrices || dbPrices.length === 0) {
      logStep("No matching price found in database", { priceId });
      throw new Error(`This product price (${priceId}) has not been synced to the database yet. Please sync the product from the admin panel first.`);
    }

    // Check if any of the found prices are active
    const activePrices = dbPrices.filter(p => p.active);
    if (activePrices.length === 0) {
      logStep("Price exists but is inactive", { priceId, dbPrices });
      throw new Error(`This price (${priceId}) exists but is not active. Please activate it in the admin panel.`);
    }

    const dbPrice = activePrices[0];
    const productId = dbPrice.product_id;
    const productName = (dbPrice as any).subscription_products?.name || "Unknown Product";
    logStep("Found product in database", { productId, productName });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create during checkout");
    }

    const isOneTimePayment = !price.recurring;
    logStep("Payment type determined", { 
      priceId, 
      amount: price.unit_amount, 
      currency: price.currency, 
      isOneTime: isOneTimePayment 
    });

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
        product_name: productName
      },
    };

    logStep("Creating checkout session", { mode: sessionConfig.mode, metadata: sessionConfig.metadata });

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
      logStep("Checkout session created successfully", { sessionId: session.id, url: session.url });
    } catch (stripeError) {
      logStep("Stripe checkout creation failed", { error: stripeError.message, config: sessionConfig });
      throw new Error(`Failed to create checkout session: ${stripeError.message}`);
    }

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
