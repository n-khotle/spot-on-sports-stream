import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-STRIPE-PRODUCT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Check for Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin access verified");

    const { productId } = await req.json();
    if (!productId) throw new Error("Product ID is required");

    // Get product from database
    const { data: product, error: productError } = await supabaseClient
      .from('subscription_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw new Error(`Product not found: ${productError.message}`);
    logStep("Product found", { productId: product.id, name: product.name });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let stripeProduct;
    
    if (product.stripe_product_id) {
      // Update existing Stripe product
      logStep("Updating existing Stripe product", { stripeProductId: product.stripe_product_id });
      stripeProduct = await stripe.products.update(product.stripe_product_id, {
        name: product.name,
        description: product.description || undefined,
        active: product.active,
      });
    } else {
      // Create new Stripe product
      logStep("Creating new Stripe product");
      stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description || undefined,
        active: product.active,
      });

      // Update database with Stripe product ID
      const { error: updateError } = await supabaseClient
        .from('subscription_products')
        .update({ stripe_product_id: stripeProduct.id })
        .eq('id', productId);

      if (updateError) throw updateError;
    }
    logStep("Stripe product synced", { stripeProductId: stripeProduct.id });

    // Get prices for this product
    const { data: prices, error: pricesError } = await supabaseClient
      .from('subscription_prices')
      .select('*')
      .eq('product_id', productId);

    if (pricesError) throw pricesError;

    // Sync prices with Stripe
    for (const price of prices || []) {
      let stripePrice;
      
      if (price.stripe_price_id) {
        // Update existing price (note: Stripe prices are immutable, so we can only update limited fields)
        try {
          stripePrice = await stripe.prices.update(price.stripe_price_id, {
            active: price.active,
            nickname: price.nickname || undefined,
          });
          logStep("Stripe price updated", { stripePriceId: stripePrice.id });
        } catch (error) {
          logStep("Error updating price, creating new one", { error: error.message });
          // If update fails, create a new price
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring: {
              interval: price.interval as 'day' | 'week' | 'month' | 'year',
              interval_count: price.interval_count,
            },
            nickname: price.nickname || undefined,
            active: price.active,
          });

          // Update database with new Stripe price ID
          await supabaseClient
            .from('subscription_prices')
            .update({ stripe_price_id: stripePrice.id })
            .eq('id', price.id);
        }
      } else {
        // Create new Stripe price
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          recurring: {
            interval: price.interval as 'day' | 'week' | 'month' | 'year',
            interval_count: price.interval_count,
          },
          nickname: price.nickname || undefined,
          active: price.active,
        });

        // Update database with Stripe price ID
        const { error: updatePriceError } = await supabaseClient
          .from('subscription_prices')
          .update({ stripe_price_id: stripePrice.id })
          .eq('id', price.id);

        if (updatePriceError) throw updatePriceError;
        logStep("Stripe price created", { stripePriceId: stripePrice.id });
      }
    }

    logStep("Product and prices synced successfully");

    return new Response(JSON.stringify({
      success: true,
      stripe_product_id: stripeProduct.id,
      prices_count: prices?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-stripe-product", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});