import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RedeemInviteRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, message: "Please sign in to redeem an invitation" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ success: false, message: "Please sign in to redeem an invitation" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);
    // ========== END AUTHENTICATION CHECK ==========

    const { code }: RedeemInviteRequest = await req.json();

    // Input validation
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid invitation code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedCode = code.trim().toUpperCase();

    // Check if user is already a tester
    const { data: existingTester } = await supabaseAdmin
      .from("tester_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingTester) {
      return new Response(
        JSON.stringify({ success: false, message: "You already have a tester account", already_tester: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("tester_invitations")
      .select("*")
      .eq("code", sanitizedCode)
      .eq("is_active", true)
      .maybeSingle();

    if (inviteError || !invitation) {
      console.error("Invitation lookup error:", inviteError);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired invitation code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: "This invitation has expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if max uses reached
    if (invitation.max_uses && invitation.uses_count >= invitation.max_uses) {
      return new Response(
        JSON.stringify({ success: false, message: "This invitation has reached its maximum uses" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create tester account
    const { error: createError } = await supabaseAdmin.from("tester_accounts").insert({
      user_id: user.id,
      note: `Via invite: ${sanitizedCode}`,
    });

    if (createError) {
      console.error("Failed to create tester account:", createError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to activate tester account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment uses count
    await supabaseAdmin
      .from("tester_invitations")
      .update({ uses_count: invitation.uses_count + 1 })
      .eq("id", invitation.id);

    console.log(`Tester account created for user ${user.id} via invite ${sanitizedCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome to ToothyQuest Tester Mode! You have 7 days of full access.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error redeeming tester invite:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
