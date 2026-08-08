import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_brushing_history",
  title: "Get brushing history",
  description: "Get recent brushing sessions for one of the signed-in parent's children.",
  inputSchema: {
    child_id: z.string().uuid().describe("The child's id, from list_children."),
    limit: z.number().int().describe("How many recent sessions to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ child_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(Number.isFinite(limit) ? limit : 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("brushing_sessions")
      .select("id, child_id, session_type, duration_seconds, completed_at")
      .eq("child_id", child_id)
      .order("completed_at", { ascending: false })
      .limit(take);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { sessions: data ?? [] },
    };
  },
});
