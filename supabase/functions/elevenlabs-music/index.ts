import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 5; // Max requests per window (stricter for music - more expensive)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token
    const token = authHeader.replace("Bearer ", "");
    
    // Create admin client to verify user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Rate limiting check
    const windowStart = new Date(Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS);
    const endpoint = "elevenlabs-music";

    // Get current request count for this user in this window
    const { data: existingLimit, error: limitError } = await supabaseAdmin
      .from("rate_limits")
      .select("request_count")
      .eq("user_id", user.id)
      .eq("endpoint", endpoint)
      .eq("window_start", windowStart.toISOString())
      .single();

    if (limitError && limitError.code !== "PGRST116") {
      console.error("Rate limit check error:", limitError);
    }

    const currentCount = existingLimit?.request_count ?? 0;

    if (currentCount >= RATE_LIMIT_REQUESTS) {
      console.warn(`Rate limit exceeded for user ${user.id}: ${currentCount}/${RATE_LIMIT_REQUESTS}`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please wait a minute before generating more music.",
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
        .eq("user_id", user.id)
        .eq("endpoint", endpoint)
        .eq("window_start", windowStart.toISOString());
    } else {
      await supabaseAdmin
        .from("rate_limits")
        .insert({
          user_id: user.id,
          endpoint,
          window_start: windowStart.toISOString(),
          request_count: 1
        });
    }

    console.log(`Rate limit: ${currentCount + 1}/${RATE_LIMIT_REQUESTS} for user ${user.id}`);

    const { prompt, duration = 15 } = await req.json();

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

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const trimmedPrompt = prompt.trim().slice(0, 500);

    if (trimmedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate duration
    const safeDuration = typeof duration === "number" ? duration : 15;
    if (safeDuration < 5 || safeDuration > 60) {
      return new Response(
        JSON.stringify({ error: "Duration must be between 5-60 seconds" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating music for prompt: "${trimmedPrompt.substring(0, 50)}..." with duration ${safeDuration}s`);

    const response = await fetch(
      "https://api.elevenlabs.io/v1/music",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          duration_seconds: safeDuration,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs Music API error:", errorText);
      throw new Error(`ElevenLabs Music API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Successfully generated music of size ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Music generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate music";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
