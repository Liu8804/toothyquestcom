import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChildrenTool from "./tools/list-children";
import getBrushingHistoryTool from "./tools/get-brushing-history";
import getChildProgressTool from "./tools/get-child-progress";
import getStreakTool from "./tools/get-streak";
import logBrushingSessionTool from "./tools/log-brushing-session";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "toothyquest-adventures",
  title: "ToothyQuest Adventures",
  version: "0.1.0",
  instructions:
    "Tools for ToothyQuest Adventures, a kids' dental-habit app. Use list_children first to get child ids, then get_brushing_history, get_child_progress or get_streak to report on habits, and log_brushing_session to record a brushing session.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listChildrenTool,
    getBrushingHistoryTool,
    getChildProgressTool,
    getStreakTool,
    logBrushingSessionTool,
  ],
});
