import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TesterReminderRequest {
  email: string;
  days_remaining: number;
  reminder_type: "day6_warning" | "trial_expired";
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
        JSON.stringify({ error: "Authentication required" }),
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
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);
    // ========== END AUTHENTICATION CHECK ==========

    const { email, days_remaining, reminder_type }: TesterReminderRequest = await req.json();

    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validReminderTypes = ["day6_warning", "trial_expired"];
    if (!validReminderTypes.includes(reminder_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid reminder_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const safeEmail = email.trim().toLowerCase().slice(0, 255);

    console.log(`Sending ${reminder_type} email to ${safeEmail}`);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    let subject = "";
    let htmlContent = "";

    switch (reminder_type) {
      case "day6_warning":
        subject = `⏰ Your ToothyQuest trial ends tomorrow!`;
        htmlContent = `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px;">
            <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
              <h1 style="color: #667eea; font-size: 32px; margin-bottom: 20px;">⏰ Trial Ending Soon!</h1>
              <p style="font-size: 20px; color: #333; margin-bottom: 20px;">
                Your <strong>7-day ToothyQuest tester trial</strong> ends tomorrow!
              </p>
              <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                You have <strong style="color: #f59e0b;">${days_remaining} day${days_remaining !== 1 ? 's' : ''}</strong> left to explore all quests, mini-games, and rewards.
              </p>
              <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                Make sure to complete today's brushing quest with your child! 🦷✨
              </p>
              <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                Open ToothyQuest 🚀
              </a>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 14px; color: #999;">
                  Loved ToothyQuest? Subscribe to keep full access after your trial! 💙
                </p>
              </div>
            </div>
          </div>
        `;
        break;

      case "trial_expired":
        subject = `🎉 Thanks for testing ToothyQuest!`;
        htmlContent = `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; border-radius: 20px;">
            <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
              <h1 style="color: #11998e; font-size: 32px; margin-bottom: 20px;">🎉 Thank You for Testing!</h1>
              <p style="font-size: 20px; color: #333; margin-bottom: 20px;">
                Your 7-day ToothyQuest trial has ended.
              </p>
              <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
                We hope you and your little one had fun brushing teeth! 🦷
              </p>
              <p style="font-size: 16px; color: #666; margin-bottom: 30px;">
                You can continue using ToothyQuest with our free daily quests, or subscribe to unlock everything!
              </p>
              <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                Continue Brushing! 🦷
              </a>
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                Questions? Reply to this email - we'd love your feedback!
              </p>
            </div>
          </div>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "ToothyQuest <onboarding@resend.dev>",
      to: [safeEmail],
      subject,
      html: htmlContent,
    });

    console.log("Tester reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending tester reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
