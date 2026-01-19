import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PURCHASE] ${step}${detailsStr}`);
};

// All valid ToothyQuest product IDs (legacy + new monthly + annual)
const VALID_PRODUCT_IDS = [
  "prod_ToVdXfL4456xpF",  // Legacy $3.99 one-time
  "prod_ToloozqRZM4fpp", // New $4.99 monthly one-time
  "prod_ToloWHHcJ4wnOm", // New $49.99 annual one-time
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    let hasPurchased = false;
    let purchasedProductId: string | null = null;

    // Method 1: Check by Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      // Check for completed payment intents with any ToothyQuest product
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      for (const pi of paymentIntents.data) {
        if (pi.status === "succeeded") {
          // Get the checkout session to verify the product
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: pi.id,
            limit: 1,
          });
          
          if (sessions.data.length > 0) {
            const session = sessions.data[0];
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
            
            for (const item of lineItems.data) {
              const productId = item.price?.product as string;
              if (VALID_PRODUCT_IDS.includes(productId)) {
                hasPurchased = true;
                purchasedProductId = productId;
                logStep("Found ToothyQuest purchase via customer", { sessionId: session.id, productId });
                break;
              }
            }
          }
        }
        if (hasPurchased) break;
      }
    } else {
      logStep("No Stripe customer found for email");
    }

    // Method 2: Also check checkout sessions by email directly (for guest checkouts)
    if (!hasPurchased) {
      logStep("Checking checkout sessions by email");
      const sessions = await stripe.checkout.sessions.list({
        customer_details: { email: user.email },
        status: "complete",
        limit: 50,
      });

      for (const session of sessions.data) {
        if (session.payment_status === "paid") {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
          
          for (const item of lineItems.data) {
            const productId = item.price?.product as string;
            if (VALID_PRODUCT_IDS.includes(productId)) {
              hasPurchased = true;
              purchasedProductId = productId;
              logStep("Found ToothyQuest purchase via session email", { sessionId: session.id, productId });
              break;
            }
          }
        }
        if (hasPurchased) break;
      }
    }

    // Method 3: Check sessions by metadata user_email
    if (!hasPurchased) {
      logStep("Checking sessions by metadata");
      const allSessions = await stripe.checkout.sessions.list({
        status: "complete",
        limit: 100,
      });

      for (const session of allSessions.data) {
        // Check if session metadata matches user email or ID
        if (
          session.payment_status === "paid" && 
          (session.metadata?.user_email === user.email || session.metadata?.user_id === user.id)
        ) {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
          
          for (const item of lineItems.data) {
            const productId = item.price?.product as string;
            if (VALID_PRODUCT_IDS.includes(productId)) {
              hasPurchased = true;
              purchasedProductId = productId;
              logStep("Found ToothyQuest purchase via metadata", { sessionId: session.id, productId });
              break;
            }
          }
        }
        if (hasPurchased) break;
      }
    }

    logStep("Purchase check complete", { hasPurchased, purchasedProductId });

    return new Response(JSON.stringify({ 
      purchased: hasPurchased,
      product_id: purchasedProductId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
