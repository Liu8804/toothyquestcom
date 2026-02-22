import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

// Default Toothy voice ID
const DEFAULT_VOICE_ID = "LSfMSUsuD24K9gbY84R5";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // We support BOTH signed-in users and guests.
    // Signed-in: Authorization Bearer <access_token> (verified)
    // Guest: Authorization Bearer <publishable_key> OR missing token, rate-limited by hashed IP/UA.
    const authHeader = req.headers.get("Authorization") ?? "";
    const apikeyHeader = req.headers.get("apikey") ?? "";

    if (!authHeader.startsWith("Bearer ") && !apikeyHeader) {
      console.error("Missing authorization/apikey headers");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: treat as guest
    let rateLimitKey = "guest";

    // If there's a bearer token, attempt to validate it as a real user session.
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();

      // Use anon key client for auth verification (same pattern as redeem-code)
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );

      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && userData?.user?.id) {
        rateLimitKey = userData.user.id;
        console.log("Authenticated user:", rateLimitKey);
      } else {
        // Not a valid session token: fall back to guest rate limiting.
        // (We intentionally do NOT hard-fail here to support guest mode.)
        console.log("Guest request (no valid user session)");
      }
    }

    // For guests, derive a stable-ish rate limit key from IP + UA (hashed, no raw IP stored).
    if (rateLimitKey === "guest") {
      const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
      const cfIp = req.headers.get("cf-connecting-ip") ?? "";
      const ip = (forwardedFor.split(",")[0]?.trim() || cfIp || "unknown").slice(0, 128);
      const ua = (req.headers.get("user-agent") ?? "unknown").slice(0, 256);
      const raw = `${ip}|${ua}`;
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(raw)
      );
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      rateLimitKey = `guest:${hex.slice(0, 32)}`;
    }

    // Create admin client for rate limiting (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Rate limiting check
    const windowStart = new Date(Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS);
    const endpoint = "elevenlabs-tts";

    // Get current request count for this user in this window
    const { data: existingLimit, error: limitError } = await supabaseAdmin
      .from("rate_limits")
      .select("request_count")
      .eq("user_id", rateLimitKey)
      .eq("endpoint", endpoint)
      .eq("window_start", windowStart.toISOString())
      .single();

    if (limitError && limitError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is fine
      console.error("Rate limit check error:", limitError);
    }

    const currentCount = existingLimit?.request_count ?? 0;

    if (currentCount >= RATE_LIMIT_REQUESTS) {
      console.warn(
        `Rate limit exceeded for key ${rateLimitKey}: ${currentCount}/${RATE_LIMIT_REQUESTS}`
      );
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait a minute before generating more speech.",
          retry_after: 60 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update rate limit counter
    if (existingLimit) {
      await supabaseAdmin
        .from("rate_limits")
        .update({ request_count: currentCount + 1 })
        .eq("user_id", rateLimitKey)
        .eq("endpoint", endpoint)
        .eq("window_start", windowStart.toISOString());
    } else {
      await supabaseAdmin
        .from("rate_limits")
        .insert({
          user_id: rateLimitKey,
          endpoint,
          window_start: windowStart.toISOString(),
          request_count: 1
        });
    }

    console.log(
      `Rate limit: ${currentCount + 1}/${RATE_LIMIT_REQUESTS} for key ${rateLimitKey}`
    );

    const { text, voiceId = DEFAULT_VOICE_ID, voiceSettings } = await req.json();

    // Normalize the key in case it was pasted with quotes or a header prefix
    const rawElevenKey = Deno.env.get("ELEVENLABS_API_KEY") ?? "";
    const ELEVENLABS_API_KEY = rawElevenKey
      .trim()
      .replace(/^xi-api-key\s*:\s*/i, "")
      .replace(/^bearer\s+/i, "")
      .replace(/^['"]|['"]$/g, "");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    console.log(`ELEVENLABS_API_KEY loaded (length: ${ELEVENLABS_API_KEY.length})`);

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required and must be a string" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Limit text length for safety
    const trimmedText = text.trim().slice(0, 2000);

    if (trimmedText.length === 0) {
      return new Response(
        JSON.stringify({ error: "Text cannot be empty" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Kid-friendly voice settings: playful, energetic, and fun for ages 4-8
    const stability = voiceSettings?.stability ?? 0.25;
    const similarityBoost = voiceSettings?.similarityBoost ?? 0.85;
    const style = voiceSettings?.style ?? 0.9;
    const speed = voiceSettings?.speed ?? 1.0;

    console.log(`Generating TTS for text of length ${trimmedText.length} with voice ${voiceId}, stability: ${stability}, style: ${style}, speed: ${speed}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: true,
            speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);

      let message = `ElevenLabs API error: ${response.status}`;
      try {
        const parsed = JSON.parse(errorText);
        message =
          parsed?.detail?.message ||
          parsed?.message ||
          parsed?.error ||
          message;
      } catch {
        // non-JSON error
      }

      return new Response(JSON.stringify({ error: message }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Successfully generated audio of size ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate speech";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
