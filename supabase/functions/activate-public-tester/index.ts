import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, message: "Please sign in first" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabaseAdmin.auth.getClaims(token);

    if (claimsError || !claims?.claims?.sub) {
      console.error("Authentication failed:", claimsError?.message || "No claims found");
      return new Response(
        JSON.stringify({ success: false, message: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;
    console.log("Activating public tester for user:", userId);
    // ========== END AUTHENTICATION CHECK ==========

    // Check if user is already a tester
    const { data: existingTester } = await supabaseAdmin
      .from("tester_accounts")
      .select("id, is_active, trial_end_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingTester) {
      // Already a tester
      const isActive = existingTester.is_active && new Date(existingTester.trial_end_at) > new Date();
      return new Response(
        JSON.stringify({
          success: true,
          message: isActive ? "You already have tester access!" : "Your tester trial has ended",
          already_tester: true,
          is_active: isActive,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is already a paid subscriber or has manual entitlement
    const { data: entitlement } = await supabaseAdmin
      .from("manual_entitlements")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (entitlement) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "You already have full access!",
          has_entitlement: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create tester account with 7-day trial starting now
    const trialStartAt = new Date();
    const trialEndAt = new Date(trialStartAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const { error: createError } = await supabaseAdmin.from("tester_accounts").insert({
      user_id: userId,
      trial_start_at: trialStartAt.toISOString(),
      trial_end_at: trialEndAt.toISOString(),
      note: "Via public tester link",
      is_active: true,
    });

    if (createError) {
      console.error("Failed to create tester account:", createError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to activate tester mode" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create activity summary for tracking
    await supabaseAdmin.from("tester_activity_summary").insert({
      user_id: userId,
    });

    console.log(`Tester account created for user ${userId} - Trial ends ${trialEndAt.toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome to ToothyQuest Tester Mode! You have 7 days of full access.",
        trial_end_at: trialEndAt.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error activating public tester:", message);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
