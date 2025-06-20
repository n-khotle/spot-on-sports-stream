
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
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ 
        error: "Stripe secret key is not configured. Please add STRIPE_SECRET_KEY to your Supabase secrets." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    logStep("Stripe key verified");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      return new Response(JSON.stringify({ 
        error: "Authorization header is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    logStep("Attempting to authenticate user");
    
    // Use anon key client for user auth check
    const supabaseAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      return new Response(JSON.stringify({ 
        error: `Authentication error: ${userError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    if (!user) {
      logStep("ERROR: User not found");
      return new Response(JSON.stringify({ 
        error: "User not authenticated" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("User authenticated", { userId: user.id });

    // Check if user is admin using service role client
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      logStep("ERROR: Failed to fetch user profile", { error: profileError.message });
      return new Response(JSON.stringify({ 
        error: `Failed to fetch user profile: ${profileError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (profile?.role !== 'admin') {
      logStep("ERROR: Unauthorized access attempt", { userRole: profile?.role });
      return new Response(JSON.stringify({ 
        error: "Unauthorized: Admin access required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    logStep("Admin access verified");

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError.message });
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { productId } = requestBody;
    if (!productId) {
      logStep("ERROR: Product ID is missing");
      return new Response(JSON.stringify({ 
        error: "Product ID is required in request body" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    logStep("Product ID received", { productId });

    // Get product from database using service role client
    const { data: product, error: productError } = await supabaseClient
      .from('subscription_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      logStep("ERROR: Failed to fetch product", { error: productError.message, productId });
      return new Response(JSON.stringify({ 
        error: `Product not found: ${productError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    logStep("Product found", { productId: product.id, name: product.name });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let stripeProduct;
    
    if (product.stripe_product_id) {
      // Update existing Stripe product
      logStep("Updating existing Stripe product", { stripeProductId: product.stripe_product_id });
      try {
        stripeProduct = await stripe.products.update(product.stripe_product_id, {
          name: product.name,
          description: product.description || undefined,
          active: product.active,
        });
        logStep("Stripe product updated successfully", { stripeProductId: stripeProduct.id });
      } catch (stripeError) {
        logStep("ERROR: Failed to update Stripe product", { error: stripeError.message });
        return new Response(JSON.stringify({ 
          error: `Failed to update Stripe product: ${stripeError.message}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else {
      // Create new Stripe product
      logStep("Creating new Stripe product");
      try {
        stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description || undefined,
          active: product.active,
        });
        logStep("Stripe product created successfully", { stripeProductId: stripeProduct.id });

        // Update database with Stripe product ID using service role client
        const { error: updateError } = await supabaseClient
          .from('subscription_products')
          .update({ stripe_product_id: stripeProduct.id })
          .eq('id', productId);

        if (updateError) {
          logStep("ERROR: Failed to update product with Stripe ID", { error: updateError.message });
          return new Response(JSON.stringify({ 
            error: `Failed to update product with Stripe ID: ${updateError.message}` 
          }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
        }
        logStep("Product updated with Stripe ID");
      } catch (stripeError) {
        logStep("ERROR: Failed to create Stripe product", { error: stripeError.message });
        return new Response(JSON.stringify({ 
          error: `Failed to create Stripe product: ${stripeError.message}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }

    // Get prices for this product using service role client
    const { data: prices, error: pricesError } = await supabaseClient
      .from('subscription_prices')
      .select('*')
      .eq('product_id', productId);

    if (pricesError) {
      logStep("ERROR: Failed to fetch prices", { error: pricesError.message });
      return new Response(JSON.stringify({ 
        error: `Failed to fetch prices: ${pricesError.message}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    logStep("Found prices to sync", { count: prices?.length || 0 });

    // Sync prices with Stripe
    let syncedPricesCount = 0;
    for (const price of prices || []) {
      try {
        let stripePrice;
        
        if (price.stripe_price_id) {
          // Update existing price (note: Stripe prices are immutable, so we can only update limited fields)
          try {
            stripePrice = await stripe.prices.update(price.stripe_price_id, {
              active: price.active,
              nickname: price.nickname || undefined,
            });
            logStep("Stripe price updated", { stripePriceId: stripePrice.id });
          } catch (updateError) {
            logStep("Price update failed, creating new one", { error: updateError.message });
            // If update fails, create a new price
            const priceConfig: any = {
              product: stripeProduct.id,
              unit_amount: price.unit_amount,
              currency: price.currency,
              nickname: price.nickname || undefined,
              active: price.active,
            };

            // Add recurring config only if not a one-time payment
            if (price.interval !== 'once') {
              priceConfig.recurring = {
                interval: price.interval as 'day' | 'week' | 'month' | 'year',
                interval_count: price.interval_count,
              };
            }

            stripePrice = await stripe.prices.create(priceConfig);

            // Update database with new Stripe price ID using service role client
            await supabaseClient
              .from('subscription_prices')
              .update({ stripe_price_id: stripePrice.id })
              .eq('id', price.id);
          }
        } else {
          // Create new Stripe price
          const priceConfig: any = {
            product: stripeProduct.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            nickname: price.nickname || undefined,
            active: price.active,
          };

          // Add recurring config only if not a one-time payment
          if (price.interval !== 'once') {
            priceConfig.recurring = {
              interval: price.interval as 'day' | 'week' | 'month' | 'year',
              interval_count: price.interval_count,
            };
          }

          logStep("Creating Stripe price", { interval: price.interval, isOneTime: price.interval === 'once', config: priceConfig });
          stripePrice = await stripe.prices.create(priceConfig);

          // Update database with Stripe price ID using service role client
          const { error: updatePriceError } = await supabaseClient
            .from('subscription_prices')
            .update({ stripe_price_id: stripePrice.id })
            .eq('id', price.id);

          if (updatePriceError) {
            logStep("ERROR: Failed to update price with Stripe ID", { error: updatePriceError.message });
            // Continue with other prices instead of failing completely
          } else {
            logStep("Price updated with Stripe ID", { priceId: price.id, stripePriceId: stripePrice.id });
          }
        }
        syncedPricesCount++;
      } catch (priceError) {
        logStep("ERROR: Failed to sync price", { priceId: price.id, error: priceError.message });
        // Continue with other prices instead of failing completely
      }
    }

    logStep("Product and prices synced successfully", { syncedPricesCount });

    return new Response(JSON.stringify({
      success: true,
      stripe_product_id: stripeProduct.id,
      synced_prices_count: syncedPricesCount,
      total_prices: prices?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-stripe-product", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: `Internal server error: ${errorMessage}` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
