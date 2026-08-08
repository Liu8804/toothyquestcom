import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_child_progress",
  title: "Get child progress",
  description: "Get quest completions, game scores and total XP for one of the signed-in parent's children.",
  inputSchema: {
    child_id: z.string().uuid().describe("The child's id, from list_children."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ child_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);

    const [quests, games] = await Promise.all([
      supabase
        .from("quest_progress")
        .select("quest_id, xp_earned, completed_at")
        .eq("child_id", child_id)
        .order("completed_at", { ascending: false })
        .limit(100),
      supabase
        .from("game_scores")
        .select("game_id, score, stars_earned, played_at")
        .eq("child_id", child_id)
        .order("played_at", { ascending: false })
        .limit(100),
    ]);

    const error = quests.error ?? games.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const questRows = quests.data ?? [];
    const gameRows = games.data ?? [];
    const summary = {
      quests_completed: questRows.length,
      total_xp: questRows.reduce((sum, q) => sum + (q.xp_earned ?? 0), 0),
      games_played: gameRows.length,
      total_stars: gameRows.reduce((sum, g) => sum + (g.stars_earned ?? 0), 0),
      recent_quests: questRows.slice(0, 20),
      recent_games: gameRows.slice(0, 20),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
