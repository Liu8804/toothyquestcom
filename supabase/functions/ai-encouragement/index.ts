import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const { childName, sessionType, durationSeconds } = await req.json();
    
    console.log("Generating encouragement for:", { childName, sessionType, durationSeconds });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are Toothy, a friendly tooth mascot creating personalized encouragement messages for children after they complete a brushing session. 

Your messages should be:
- Super enthusiastic and celebratory
- Short (2-3 sentences max)
- Use fun language kids love (sparkle, super, amazing, hero, champion)
- Include tooth/dental themed references
- Personalized with the child's name if provided
- Age-appropriate for children 3-9 years old
- Include one fun emoji at the end

Do NOT use asterisks or markdown formatting. Just plain text with an emoji.`
          },
          {
            role: "user",
            content: `Generate a fun, personalized celebration message for ${childName || "a young tooth hero"} who just completed their ${sessionType || "morning"} brushing session and brushed for ${Math.floor((durationSeconds || 120) / 60)} minutes! Make them feel like a champion!`
          }
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded",
            fallbackMessage: `Amazing job, ${childName || "Tooth Hero"}! Your smile is sparkling! ⭐`
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ 
            error: "Payment required",
            fallbackMessage: `Super brushing, ${childName || "Champion"}! Your teeth are so happy! 🦷`
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate message");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || `Fantastic job, ${childName || "Tooth Hero"}! Your teeth are sparkling clean! ✨`;

    console.log("Generated encouragement:", message);

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Encouragement generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate encouragement",
        fallbackMessage: "Amazing brushing! You're a true Tooth Hero! 🌟"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
