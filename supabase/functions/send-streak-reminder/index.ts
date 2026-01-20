import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StreakReminderRequest {
  email: string;
  child_name: string;
  current_streak: number;
  reminder_type: "streak_at_risk" | "streak_broken" | "encouragement";
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

    const { email, child_name, current_streak, reminder_type }: StreakReminderRequest = await req.json();

    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!child_name || typeof child_name !== "string" || child_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid child_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof current_streak !== "number" || current_streak < 0) {
      return new Response(
        JSON.stringify({ error: "Invalid current_streak" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validReminderTypes = ["streak_at_risk", "streak_broken", "encouragement"];
    if (!validReminderTypes.includes(reminder_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid reminder_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const safeChildName = child_name.trim().slice(0, 50);
    const safeEmail = email.trim().toLowerCase().slice(0, 255);

    console.log(`Sending ${reminder_type} email to ${safeEmail} for ${safeChildName}`);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    let subject = "";
    let htmlContent = "";

    switch (reminder_type) {
      case "streak_at_risk":
        subject = `🔥 ${safeChildName}'s ${current_streak}-day streak is at risk!`;
        htmlContent = `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px;">
            <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
              <h1 style="color: #667eea; font-size: 32px; margin-bottom: 20px;">🔥 Streak Alert! 🔥</h1>
              <p style="font-size: 20px; color: #333; margin-bottom: 20px;">
                <strong>${safeChildName}</strong> has an amazing <strong style="color: #f59e0b;">${current_streak}-day</strong> brushing streak!
              </p>
              <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Don't let it end! Open ToothyQuest now for a quick brushing adventure! 🦷✨
              </p>
              <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                Open ToothyQuest 🚀
              </a>
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                Keep those teeth sparkling! - Toothy 🦷
              </p>
            </div>
          </div>
        `;
        break;

      case "streak_broken":
        subject = `💪 ${safeChildName} can start a new streak today!`;
        htmlContent = `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; border-radius: 20px;">
            <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
              <h1 style="color: #f5576c; font-size: 32px; margin-bottom: 20px;">🌟 New Adventure Awaits! 🌟</h1>
              <p style="font-size: 20px; color: #333; margin-bottom: 20px;">
                Hey there! <strong>${safeChildName}</strong> missed yesterday's brushing quest.
              </p>
              <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                But that's okay! Every hero falls sometimes. Today is a brand new day to start an even BIGGER streak! 💪
              </p>
              <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                Start New Streak 🔥
              </a>
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                We believe in you! - Toothy 🦷
              </p>
            </div>
          </div>
        `;
        break;

      case "encouragement":
        subject = `🎉 Amazing! ${safeChildName} hit a ${current_streak}-day streak!`;
        htmlContent = `
          <div style="font-family: 'Comic Sans MS', cursive, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px; border-radius: 20px;">
            <div style="background: white; border-radius: 20px; padding: 30px; text-align: center;">
              <h1 style="color: #11998e; font-size: 32px; margin-bottom: 20px;">🎉 INCREDIBLE! 🎉</h1>
              <p style="font-size: 24px; color: #333; margin-bottom: 20px;">
                <strong>${safeChildName}</strong> just hit a
              </p>
              <p style="font-size: 48px; color: #f59e0b; font-weight: bold; margin: 20px 0;">
                ${current_streak} Day Streak! 🔥
              </p>
              <p style="font-size: 18px; color: #666; margin-bottom: 30px;">
                Those teeth are getting SUPER clean! Keep up the amazing work! ⭐
              </p>
              <a href="https://toothyquestcom.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold;">
                Continue the Quest! 🦷
              </a>
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                You're a superstar! - Toothy 🦷
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

    console.log("Streak reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending streak reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
