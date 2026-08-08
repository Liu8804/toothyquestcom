import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_streak",
  title: "Get brushing streak",
  description: "Get the signed-in user's current and longest brushing streak.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_activity_date, updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const streak = data ?? { current_streak: 0, longest_streak: 0, last_activity_date: null };
    return {
      content: [{ type: "text", text: JSON.stringify(streak) }],
      structuredContent: { streak },
    };
  },
});
