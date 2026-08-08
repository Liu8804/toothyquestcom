import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_brushing_session",
  title: "Log brushing session",
  description: "Record a completed brushing session for one of the signed-in parent's children.",
  inputSchema: {
    child_id: z.string().uuid().describe("The child's id, from list_children."),
    duration_seconds: z.number().int().describe("How long the child brushed, in seconds (1-600)."),
    session_type: z.string().describe("Session type, e.g. morning, evening or manual."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ child_id, duration_seconds, session_type }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const duration = Math.min(Math.max(Math.round(duration_seconds), 1), 600);
    const type = (session_type || "manual").trim().slice(0, 40) || "manual";

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("brushing_sessions")
      .insert({ child_id, duration_seconds: duration, session_type: type })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { session: data },
    };
  },
});
