
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

    const requestBody = await req.json();
    const { sessionId, successPayment, userEmail } = requestBody;
    
    logStep("Request details", { sessionId, successPayment, userEmail });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let customerEmail = userEmail;
    let session = null;
    let isOneTimePayment = false;
    let isMobileMoneyPayment = false;

    // Handle success=true scenario vs session ID scenario
    if (successPayment && userEmail) {
      logStep("Processing success=true payment", { userEmail });
      customerEmail = userEmail;
    } else if (sessionId) {
      logStep("Processing session ID payment", { sessionId });
      
      // Retrieve the checkout session with expanded data
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price', 'line_items.data.price.product', 'subscription', 'customer']
      });
      
      logStep("Retrieved checkout session", { 
        sessionId, 
        status: session.payment_status,
        mode: session.mode,
        customer: session.customer,
        customerEmail: session.customer_email,
        lineItemsCount: session.line_items?.data?.length || 0
      });

      // Check for mobile money product ID in line items
      if (session.line_items?.data) {
        for (const lineItem of session.line_items.data) {
          const product = lineItem.price?.product;
          if (product && typeof product === 'object' && product.id === 'prod_SX3PYQDsxXnlAG') {
            isMobileMoneyPayment = true;
            logStep("Mobile money payment detected", { productId: product.id });
            break;
          }
        }
      }

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

      // Determine if this is a one-time payment
      isOneTimePayment = session.mode === 'payment';
      logStep("Payment type determined", { mode: session.mode, isOneTimePayment, isMobileMoneyPayment });

      // Get customer email - try multiple sources
      customerEmail = session.customer_email;
      if (!customerEmail && session.customer) {
        const customer = await stripe.customers.retrieve(session.customer as string);
        customerEmail = (customer as any).email;
      }
    } else {
      throw new Error("Either sessionId or successPayment with userEmail is required");
    }
    
    if (!customerEmail) {
      logStep("ERROR: No customer email found", { 
        customerEmail: session?.customer_email,
        customerId: session?.customer,
        userEmail 
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

    // Initialize default values for database updates
    let stripeCustomerId = null;
    let subscriptionTier = "Basic";
    let subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 1); // Next day as requested
    let productAllocated = false;
    let productName = "";
    let subscriptionUpdated = false;

    if (successPayment) {
      logStep("Processing success payment - finding customer");
      
      // Find Stripe customer by email
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        logStep("Found Stripe customer for success payment", { customerId: stripeCustomerId });
        
        // For mobile money payments or success=true payments, use Basic access
        productName = "Basic Access";
        subscriptionTier = "Basic";
        
        // Check for mobile money payment by looking at recent payment intents
        const paymentIntents = await stripe.paymentIntents.list({
          customer: stripeCustomerId,
          limit: 10,
        });
        
        // Look for recent mobile money payments
        for (const pi of paymentIntents.data) {
          if (pi.status === 'succeeded' && 
              new Date(pi.created * 1000) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            
            // Check if this payment intent is for mobile money product
            const charges = await stripe.charges.list({ payment_intent: pi.id, limit: 1 });
            if (charges.data.length > 0) {
              const charge = charges.data[0];
              
              // Try to find associated product from metadata or description
              const isMobileMoney = charge.metadata?.product_id === 'prod_SX3PYQDsxXnlAG' ||
                                   charge.description?.includes('Mobile Money') ||
                                   charge.description?.includes('Basic Access');
              
              if (isMobileMoney) {
                logStep("Found recent mobile money payment", { 
                  paymentIntentId: pi.id,
                  amount: pi.amount,
                  created: new Date(pi.created * 1000).toISOString()
                });
                isMobileMoneyPayment = true;
                break;
              }
            }
          }
        }
        
        // For mobile money payments, find or create a basic product
        if (isMobileMoneyPayment) {
          // Try to find the mobile money subscription product
          const { data: mobileMoneyProduct, error: productError } = await supabaseClient
            .from('subscription_products')
            .select('*')
            .eq('stripe_product_id', 'prod_SX3PYQDsxXnlAG')
            .eq('active', true)
            .single();

          if (mobileMoneyProduct) {
            logStep("Found mobile money product", { 
              productId: mobileMoneyProduct.id, 
              productName: mobileMoneyProduct.name 
            });

            // Allocate mobile money product to user profile
            const { error: allocateError } = await supabaseClient
              .rpc('allocate_product_to_user', {
                target_user_id: profile.user_id,
                product_id: mobileMoneyProduct.id
              });

            if (allocateError) {
              logStep("ERROR allocating mobile money product", { error: allocateError.message });
            } else {
              logStep("Successfully allocated mobile money product to user");
              productAllocated = true;
              productName = mobileMoneyProduct.name;
            }
          } else {
            logStep("Mobile money product not found, using default", { error: productError?.message });
            
            // Fall back to any available active product
            const { data: defaultProduct } = await supabaseClient
              .from('subscription_products')
              .select('*')
              .eq('active', true)
              .limit(1)
              .single();

            if (defaultProduct) {
              logStep("Using default product for mobile money", { 
                productId: defaultProduct.id, 
                productName: defaultProduct.name 
              });

              const { error: allocateError } = await supabaseClient
                .rpc('allocate_product_to_user', {
                  target_user_id: profile.user_id,
                  product_id: defaultProduct.id
                });

              if (!allocateError) {
                productAllocated = true;
                productName = defaultProduct.name;
              }
            }
          }
        }
      } else {
        logStep("No Stripe customer found for success payment", { email: customerEmail });
        // For success=true without Stripe customer, still update subscription status
        productName = "Basic Access";
      }
    } else if (session) {
      // Handle payments from session (both subscription and one-time)
      stripeCustomerId = session.customer as string;
      
      if (session.mode === 'subscription' && session.subscription) {
        logStep("Processing subscription payment from session");
        
        const subscription = session.subscription as any;
        const lineItem = session.line_items?.data[0];
        const priceId = lineItem?.price?.id;
        
        subscriptionEnd = new Date(subscription.current_period_end * 1000);
        
        logStep("Subscription details from session", {
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

          if (subscriptionPrice && (subscriptionPrice as any).subscription_products) {
            const product = (subscriptionPrice as any).subscription_products;
            productName = product.name;
            subscriptionTier = product.name;
            
            logStep("Found subscription product from session", { 
              productId: product.id, 
              productName 
            });

            // Allocate product to user profile
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
          }
        }
      } else if (session.mode === 'payment') {
        // Handle one-time payment from session (including mobile money)
        logStep("Processing one-time payment from session", { isMobileMoneyPayment });
        
        const lineItem = session.line_items?.data[0];
        const amount = lineItem?.amount_total || 0;
        
        logStep("One-time payment details from session", {
          amount,
          currency: session.currency,
          totalAmount: session.amount_total,
          isMobileMoneyPayment
        });
        
        // For mobile money payments, find the specific product
        if (isMobileMoneyPayment) {
          const { data: mobileMoneyProduct, error: productError } = await supabaseClient
            .from('subscription_products')
            .select('*')
            .eq('stripe_product_id', 'prod_SX3PYQDsxXnlAG')
            .eq('active', true)
            .single();

          if (mobileMoneyProduct) {
            logStep("Found mobile money product from session", { 
              productId: mobileMoneyProduct.id, 
              productName: mobileMoneyProduct.name 
            });

            // Allocate mobile money product to user profile
            const { error: allocateError } = await supabaseClient
              .rpc('allocate_product_to_user', {
                target_user_id: profile.user_id,
                product_id: mobileMoneyProduct.id
              });

            if (allocateError) {
              logStep("ERROR allocating mobile money product from session", { error: allocateError.message });
            } else {
              logStep("Successfully allocated mobile money product to user from session");
              productAllocated = true;
              productName = mobileMoneyProduct.name;
              subscriptionTier = mobileMoneyProduct.name;
            }
          } else {
            logStep("Mobile money product not found in database", { error: productError?.message });
            productName = "Mobile Money Access";
            subscriptionTier = "Basic";
          }
        } else {
          // For other one-time payments, use default Basic access
          productName = "Basic Access";
          subscriptionTier = "Basic";
          
          // Try to find a default product for one-time payments
          const { data: defaultProduct } = await supabaseClient
            .from('subscription_products')
            .select('*')
            .eq('active', true)
            .limit(1)
            .single();

          if (defaultProduct) {
            logStep("Found default product for one-time payment from session", { 
              productId: defaultProduct.id, 
              productName: defaultProduct.name 
            });

            const { error: allocateError } = await supabaseClient
              .rpc('allocate_product_to_user', {
                target_user_id: profile.user_id,
                product_id: defaultProduct.id
              });

            if (!allocateError) {
              logStep("Successfully allocated default product to user from session");
              productAllocated = true;
              productName = defaultProduct.name;
            }
          }
        }
      }
    }

    // Update subscribers table as requested - ALWAYS set subscribed to TRUE
    const subscriberUpdate = {
      user_id: profile.user_id,
      email: customerEmail,
      stripe_customer_id: stripeCustomerId,
      subscribed: true, // Always set to TRUE as requested
      subscription_tier: subscriptionTier, // Set to "Basic" or product name
      subscription_end: subscriptionEnd.toISOString(), // Set to next day as requested
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

    // Create order record if we have session info
    if (session) {
      const orderData = {
        user_id: profile.user_id,
        stripe_session_id: session.id,
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
    }

    const result = {
      success: true,
      status: 'paid',
      allocated: productAllocated,
      subscriptionUpdated,
      productName: productName || "Basic Access",
      userId: profile.user_id,
      subscriptionTier,
      subscriptionEnd: subscriptionEnd.toISOString(),
      isOneTimePayment: isOneTimePayment || successPayment,
      isMobileMoneyPayment
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
