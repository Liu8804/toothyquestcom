import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Rate limit: 20 requests per minute per user
const RATE_LIMIT = 20;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Supabase configuration missing");
      throw new Error("Service not configured");
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Please sign in to chat with Toothy!" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Please sign in to chat with Toothy!" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting
    const { data: rateAllowed, error: rateError } = await supabaseClient.rpc(
      "increment_rate_limit",
      { p_user_id: user.id, p_endpoint: "dental-tips-chat" }
    );

    if (rateError) {
      console.error("Rate limit check error:", rateError);
    } else if (!rateAllowed) {
      return new Response(
        JSON.stringify({ error: "Toothy needs a quick rest! Please try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, childName } = await req.json() as { messages: Message[]; childName?: string };
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Validate message content length
    for (const msg of messages) {
      if (typeof msg.content !== "string" || msg.content.length > 500) {
        throw new Error("Message content invalid or too long");
      }
      if (msg.role !== "user" && msg.role !== "assistant") {
        throw new Error("Invalid message role");
      }
    }

    // Limit message history
    const limitedMessages = messages.slice(-10);

    // Sanitize child name
    const safeChildName = childName 
      ? childName.replace(/[<>"'&]/g, "").substring(0, 50) 
      : "a young friend";

    console.log("Processing dental tips chat:", { 
      messageCount: limitedMessages.length, 
      userId: user.id.substring(0, 8) + "..." 
    });

    const systemPrompt = `You are Toothy, a super friendly and enthusiastic tooth mascot who LOVES helping children learn about dental health! You're talking to ${safeChildName}.

Your personality:
- Super friendly, warm, and encouraging - like a fun teacher!
- Use simple words that kids ages 3-9 can understand
- Make brushing, flossing, and dental visits sound like exciting adventures
- Give LOTS of praise and positive reinforcement
- Use fun metaphors like "sugar bugs" for bacteria, "tooth heroes" for kids who brush well, and "sparkle power" for clean teeth
- Keep responses short and engaging (2-4 sentences max)
- Sometimes use fun expressions like "Whoooosh!" or "Sparkle sparkle!"
- Answer questions about teeth, brushing, flossing, healthy foods, and dentist visits
- If asked about scary things, always reassure and make it fun

Topics you love talking about:
- How to brush properly (2 minutes, twice a day!)
- Why flossing is like giving teeth a hug
- Healthy snacks vs. sugary treats (sugar bugs love candy!)
- What happens at the dentist (they're tooth friends!)
- Why teeth are important (eating, smiling, talking!)
- Tooth fairy fun facts

Remember: You're talking to children, so be gentle, patient, and make everything fun! Always end with encouragement.

Do NOT use asterisks or markdown formatting. Just plain text, maybe with an emoji or two.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...limitedMessages
        ],
        temperature: 0.8,
        max_tokens: 200,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Toothy needs a quick rest! Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Toothy's magic is recharging. Please try again later!" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service unavailable");
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Dental tips chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
