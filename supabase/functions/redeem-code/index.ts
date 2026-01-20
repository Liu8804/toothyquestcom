import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REDEEM-CODE] ${step}${detailsStr}`);
};

// Admin email to receive notifications
const ADMIN_EMAIL = "admin@toothyquest.com"; // Change this to your email

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role to bypass RLS for code redemption
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // User client for auth verification
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      throw new Error("Code is required");
    }

    const normalizedCode = code.trim().toUpperCase();
    logStep("Attempting to redeem code", { code: normalizedCode });

    // Check if user already has an entitlement
    const { data: existingEntitlement } = await supabaseAdmin
      .from("manual_entitlements")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntitlement) {
      logStep("User already has entitlement");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "You already have full access!",
        already_unlocked: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Find the code
    const { data: unlockCode, error: codeError } = await supabaseAdmin
      .from("unlock_codes")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (codeError) {
      logStep("Database error finding code", { error: codeError.message });
      throw new Error("Failed to verify code");
    }

    if (!unlockCode) {
      logStep("Code not found");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Invalid code. Please check and try again." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if code is active
    if (!unlockCode.is_active) {
      logStep("Code is inactive");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "This code is no longer active." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check expiration
    if (unlockCode.expires_at && new Date(unlockCode.expires_at) < new Date()) {
      logStep("Code has expired");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "This code has expired." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check redemption limit
    if (unlockCode.max_redemptions && unlockCode.redemption_count >= unlockCode.max_redemptions) {
      logStep("Code has reached max redemptions");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "This code has reached its maximum number of uses." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if user already redeemed this specific code
    const { data: existingRedemption } = await supabaseAdmin
      .from("code_redemptions")
      .select("*")
      .eq("code_id", unlockCode.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingRedemption) {
      logStep("User already redeemed this code");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "You have already used this code." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // All checks passed - redeem the code
    logStep("All checks passed, redeeming code");

    // Create redemption record
    const { error: redemptionError } = await supabaseAdmin
      .from("code_redemptions")
      .insert({
        code_id: unlockCode.id,
        user_id: user.id,
      });

    if (redemptionError) {
      logStep("Failed to create redemption record", { error: redemptionError.message });
      throw new Error("Failed to redeem code");
    }

    // Update redemption count on code
    const { error: updateError } = await supabaseAdmin
      .from("unlock_codes")
      .update({ 
        redemption_count: (unlockCode.redemption_count || 0) + 1,
        redeemed_by: user.id,
        redeemed_at: new Date().toISOString(),
      })
      .eq("id", unlockCode.id);

    if (updateError) {
      logStep("Failed to update code redemption count", { error: updateError.message });
    }

    // Create entitlement for user
    const { error: entitlementError } = await supabaseAdmin
      .from("manual_entitlements")
      .insert({
        user_id: user.id,
        granted_via: `promo_code:${normalizedCode}`,
      });

    if (entitlementError) {
      logStep("Failed to create entitlement", { error: entitlementError.message });
      throw new Error("Failed to grant access");
    }

    logStep("Code redeemed successfully");

    // Send email notification to admin
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const redemptionTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York',
          dateStyle: 'full',
          timeStyle: 'long'
        });

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6366f1; margin-bottom: 20px;">🎉 Promo Code Redeemed!</h1>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #374151;">Redemption Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Code:</strong></td>
                  <td style="padding: 8px 0; font-family: monospace; font-size: 16px; color: #6366f1; font-weight: bold;">${normalizedCode}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>User Email:</strong></td>
                  <td style="padding: 8px 0;">${user.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>User ID:</strong></td>
                  <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${user.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Code Note:</strong></td>
                  <td style="padding: 8px 0;">${unlockCode.note || 'No note'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Redemptions:</strong></td>
                  <td style="padding: 8px 0;">${(unlockCode.redemption_count || 0) + 1}/${unlockCode.max_redemptions || '∞'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;"><strong>Time:</strong></td>
                  <td style="padding: 8px 0;">${redemptionTime}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated notification from ToothyQuest.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "ToothyQuest <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `🎁 Promo Code Redeemed: ${normalizedCode}`,
          html: emailHtml,
        });

        logStep("Admin notification email sent", { to: ADMIN_EMAIL });
      } catch (emailError) {
        // Don't fail the redemption if email fails
        logStep("Failed to send admin notification email", { 
          error: emailError instanceof Error ? emailError.message : String(emailError) 
        });
      }
    } else {
      logStep("RESEND_API_KEY not configured, skipping email notification");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "🎉 Code redeemed! You now have full access to ToothyQuest!" 
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
