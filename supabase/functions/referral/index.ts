import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReferralRequest {
  action: "generate" | "apply" | "get-stats" | "send-invite";
  referral_code?: string;
  invite_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { action, referral_code, invite_email }: ReferralRequest = await req.json();

    console.log(`Referral action: ${action} for user ${user.id}`);

    switch (action) {
      case "generate": {
        // Check if user already has a referral code
        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("referral_code")
          .eq("referrer_user_id", user.id)
          .maybeSingle();

        if (existingReferral) {
          return new Response(JSON.stringify({ 
            referral_code: existingReferral.referral_code 
          }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Generate new referral code
        const { data: newCode } = await supabase.rpc("generate_referral_code");
        
        const { data: newReferral, error: insertError } = await supabase
          .from("referrals")
          .insert({
            referrer_user_id: user.id,
            referral_code: newCode,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating referral:", insertError);
          throw new Error("Failed to create referral code");
        }

        return new Response(JSON.stringify({ referral_code: newReferral.referral_code }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "apply": {
        if (!referral_code) {
          return new Response(JSON.stringify({ error: "Referral code required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Find the referral
        const { data: referral, error: findError } = await supabase
          .from("referrals")
          .select("*")
          .eq("referral_code", referral_code.toUpperCase())
          .maybeSingle();

        if (!referral) {
          return new Response(JSON.stringify({ error: "Invalid referral code" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        if (referral.referrer_user_id === user.id) {
          return new Response(JSON.stringify({ error: "Cannot use your own referral code" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        if (referral.referred_user_id) {
          return new Response(JSON.stringify({ error: "Referral code already used" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Mark referral as completed
        const { error: updateError } = await supabase
          .from("referrals")
          .update({
            referred_user_id: user.id,
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", referral.id);

        if (updateError) {
          console.error("Error updating referral:", updateError);
          throw new Error("Failed to apply referral code");
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Referral applied! You both get a free month!" 
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "get-stats": {
        // Get user's referral stats
        const { data: referrals } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_user_id", user.id);

        const totalReferrals = referrals?.length || 0;
        const completedReferrals = referrals?.filter(r => r.status === "completed" || r.status === "rewarded").length || 0;
        const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;
        const referralCode = referrals?.[0]?.referral_code || null;

        return new Response(JSON.stringify({
          referral_code: referralCode,
          total_referrals: totalReferrals,
          completed_referrals: completedReferrals,
          pending_referrals: pendingReferrals,
          rewards_earned: completedReferrals,
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case "send-invite": {
        if (!invite_email || !referral_code) {
          return new Response(JSON.stringify({ error: "Email and referral code required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        // Get user's profile for personalization
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        const senderName = profile?.display_name || "A friend";

        const emailResponse = await resend.emails.send({
          from: "ToothyQuest <onboarding@resend.dev>",
          to: [invite_email],
          subject: `${senderName} invited you to ToothyQuest! 🦷`,
          html: `
            <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px;">
              <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
                <h1 style="color: #667eea; font-size: 32px; margin-bottom: 20px;">🦷 You're Invited! 🦷</h1>
                <p style="font-size: 20px; color: #333; margin-bottom: 20px;">
                  <strong>${senderName}</strong> thinks you'd love ToothyQuest!
                </p>
                <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                  ToothyQuest makes brushing teeth FUN with stories, games, and rewards that kids actually love! 🎮✨
                </p>
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin: 20px 0;">
                  <p style="font-size: 16px; color: #333; margin-bottom: 10px;">Use this referral code:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px;">${referral_code}</p>
                  <p style="font-size: 14px; color: #11998e; margin-top: 10px;">🎁 You BOTH get a FREE month!</p>
                </div>
                <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                  Get Started Free! 🚀
                </a>
                <p style="margin-top: 30px; font-size: 14px; color: #999;">
                  Join the adventure! - Toothy 🦷
                </p>
              </div>
            </div>
          `,
        });

        console.log("Referral invite sent:", emailResponse);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
  } catch (error: any) {
    console.error("Referral error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
