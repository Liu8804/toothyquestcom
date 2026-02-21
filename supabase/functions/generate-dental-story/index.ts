import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const { ageRange, visitType } = await req.json();

    // Validate inputs
    const validAges = ["3-5", "6-7", "8-9"];
    const validVisits = ["first-visit", "cleaning", "filling", "braces", "wiggly-tooth"];

    if (!ageRange || !validAges.includes(ageRange)) {
      return new Response(
        JSON.stringify({ error: "Invalid age range" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!visitType || !validVisits.includes(visitType)) {
      return new Response(
        JSON.stringify({ error: "Invalid visit type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const visitLabels: Record<string, string> = {
      "first-visit": "their very first dental visit",
      "cleaning": "a teeth cleaning appointment",
      "filling": "getting a filling",
      "braces": "getting braces",
      "wiggly-tooth": "a wiggly tooth that might come out",
    };

    const ageGuidance: Record<string, string> = {
      "3-5": "Use very simple words (2-3 syllable max). Short sentences. Lots of repetition and sound effects like 'Whoooosh!' and 'Sparkle sparkle!'. Make the dentist feel like a friendly helper, not scary at all. 3-4 short paragraphs max.",
      "6-7": "Use simple but slightly more advanced vocabulary. Kids this age love silly humor and relatable characters. They can handle a tiny bit of 'nervousness' as long as the character overcomes it bravely. 4-5 paragraphs.",
      "8-9": "These kids appreciate a real story arc with a beginning, middle, and end. They like feeling mature. Include a fun fact about teeth. Use humor and adventure. 5-6 paragraphs.",
    };

    console.log("Generating dental story:", { ageRange, visitType });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        tools: [
          {
            type: "function",
            function: {
              name: "create_dental_story",
              description: "Create a kid-friendly dental story and parent guidance script.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "A fun, engaging story title" },
                  story: { type: "string", description: "The full kid-friendly story text. Use plain text with no markdown. Separate paragraphs with double newlines." },
                  parentScript: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 talking points parents can use to prepare their child before the visit. Each should be a complete, actionable sentence."
                  },
                  funFact: { type: "string", description: "One fun dental fact appropriate for the age group" },
                },
                required: ["title", "story", "parentScript", "funFact"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_dental_story" } },
        messages: [
          {
            role: "system",
            content: `You are Toothy, a warm and friendly tooth mascot who creates magical dental stories for children. Your stories make dental visits feel like exciting adventures, never scary.

Rules:
- NEVER give medical advice
- Always make the dentist/dental team feel like friendly helpers
- Use positive, reassuring language throughout
- Include sensory details kids can relate to (sounds, feelings, colors)
- End on a positive, empowering note
- Do NOT use asterisks or markdown formatting in the story text
- Include the child as the hero of the story`,
          },
          {
            role: "user",
            content: `Create a fun dental story for a child aged ${ageRange} about ${visitLabels[visitType]}.

Age-appropriate writing guidance: ${ageGuidance[ageRange]}

Also provide 3-5 parent talking points they can use to prepare their child, and one fun dental fact.`,
          },
        ],
        temperature: 0.85,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Toothy is resting! Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits needed. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate story");
    }

    const data = await response.json();

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      throw new Error("Failed to parse story");
    }

    let storyData;
    try {
      storyData = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse story data");
    }

    console.log("Generated story:", storyData.title);

    return new Response(
      JSON.stringify(storyData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Story generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate story",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
