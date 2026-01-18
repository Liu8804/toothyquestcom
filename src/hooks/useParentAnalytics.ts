import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  page_path: string | null;
  created_at: string;
}

interface RetentionMetrics {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  avgSessionsPerDay: number;
  totalGamesPlayed: number;
  totalStoriesRead: number;
  totalBrushingSessions: number;
  weeklyActivity: { day: string; count: number }[];
}

interface ExportData {
  analytics_events: AnalyticsEvent[];
  children: {
    id: string;
    name: string;
    avatar_emoji: string | null;
    created_at: string;
    total_xp: number;
    quest_progress: { quest_id: string; xp_earned: number; completed_at: string }[];
    earned_badges: { badge_name: string; earned_at: string }[];
    brushing_sessions: { session_type: string; duration_seconds: number; completed_at: string }[];
    game_scores: { game_id: string; score: number; stars_earned: number; played_at: string }[];
  }[];
  retention_metrics: RetentionMetrics;
  exported_at: string;
}

export const useParentAnalytics = (selectedChildId?: string) => {
  const { user } = useAuth();
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [retentionMetrics, setRetentionMetrics] = useState<RetentionMetrics>({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    avgSessionsPerDay: 0,
    totalGamesPlayed: 0,
    totalStoriesRead: 0,
    totalBrushingSessions: 0,
    weeklyActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch analytics events for the current user
  const fetchAnalyticsEvents = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      setAnalyticsEvents(data as AnalyticsEvent[]);
    }
  }, [user]);

  // Calculate retention metrics
  const calculateRetentionMetrics = useCallback(async () => {
    if (!user) return;

    // Get all children for this parent
    const { data: children } = await supabase
      .from("children")
      .select("id")
      .eq("parent_id", user.id);

    if (!children || children.length === 0) {
      setRetentionMetrics({
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        avgSessionsPerDay: 0,
        totalGamesPlayed: 0,
        totalStoriesRead: 0,
        totalBrushingSessions: 0,
        weeklyActivity: [],
      });
      return;
    }

    const childIds = children.map((c) => c.id);

    // Fetch brushing sessions
    const { data: brushingSessions } = await supabase
      .from("brushing_sessions")
      .select("completed_at, child_id")
      .in("child_id", childIds)
      .order("completed_at", { ascending: false });

    // Fetch game scores
    const { data: gameScores } = await supabase
      .from("game_scores")
      .select("played_at, child_id")
      .in("child_id", childIds);

    // Fetch quest progress (stories read)
    const { data: questProgress } = await supabase
      .from("quest_progress")
      .select("completed_at, child_id")
      .in("child_id", childIds);

    // Calculate streaks based on brushing sessions
    const sessions = brushingSessions || [];
    const uniqueDays = new Set(
      sessions.map((s) => new Date(s.completed_at).toDateString())
    );
    const sortedDays = Array.from(uniqueDays)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const expectedDay = new Date(today);
      expectedDay.setDate(expectedDay.getDate() - i);
      expectedDay.setHours(0, 0, 0, 0);

      if (day.getTime() === expectedDay.getTime()) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        if (i === 0) currentStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly activity (last 7 days)
    const weeklyActivity: { day: string; count: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = sessions.filter((s) => {
        const sessionDate = new Date(s.completed_at);
        return sessionDate >= date && sessionDate < nextDate;
      }).length;

      weeklyActivity.push({
        day: dayNames[date.getDay()],
        count,
      });
    }

    setRetentionMetrics({
      currentStreak,
      longestStreak,
      totalActiveDays: uniqueDays.size,
      avgSessionsPerDay: uniqueDays.size > 0 ? sessions.length / uniqueDays.size : 0,
      totalGamesPlayed: gameScores?.length || 0,
      totalStoriesRead: questProgress?.length || 0,
      totalBrushingSessions: sessions.length,
      weeklyActivity,
    });
  }, [user]);

  // Export all data as JSON
  const exportAsJSON = useCallback(async (): Promise<string> => {
    if (!user) return "";

    // Fetch children
    const { data: children } = await supabase
      .from("children")
      .select("id, name, avatar_emoji, created_at")
      .eq("parent_id", user.id);

    const childrenData = await Promise.all(
      (children || []).map(async (child) => {
        // Get total XP
        const { data: xpData } = await supabase.rpc("get_child_total_xp", {
          child_uuid: child.id,
        });

        // Get quest progress
        const { data: quests } = await supabase
          .from("quest_progress")
          .select("quest_id, xp_earned, completed_at")
          .eq("child_id", child.id);

        // Get earned badges with names
        const { data: badges } = await supabase
          .from("earned_badges")
          .select("earned_at, badges(name)")
          .eq("child_id", child.id);

        // Get brushing sessions
        const { data: brushing } = await supabase
          .from("brushing_sessions")
          .select("session_type, duration_seconds, completed_at")
          .eq("child_id", child.id);

        // Get game scores
        const { data: games } = await supabase
          .from("game_scores")
          .select("game_id, score, stars_earned, played_at")
          .eq("child_id", child.id);

        return {
          id: child.id,
          name: child.name,
          avatar_emoji: child.avatar_emoji,
          created_at: child.created_at,
          total_xp: xpData || 0,
          quest_progress: quests || [],
          earned_badges: (badges || []).map((b) => ({
            badge_name: (b.badges as { name: string } | null)?.name || "Unknown",
            earned_at: b.earned_at,
          })),
          brushing_sessions: brushing || [],
          game_scores: games || [],
        };
      })
    );

    const exportData: ExportData = {
      analytics_events: analyticsEvents,
      children: childrenData,
      retention_metrics: retentionMetrics,
      exported_at: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }, [user, analyticsEvents, retentionMetrics]);

  // Export as CSV
  const exportAsCSV = useCallback(async (): Promise<string> => {
    if (!user) return "";

    const rows: string[] = [];

    // Analytics Events Header
    rows.push("=== ANALYTICS EVENTS ===");
    rows.push("Event Name,Event Data,Page Path,Created At");
    analyticsEvents.forEach((event) => {
      rows.push(
        `"${event.event_name}","${JSON.stringify(event.event_data || {}).replace(/"/g, '""')}","${event.page_path || ""}","${event.created_at}"`
      );
    });

    rows.push("");
    rows.push("=== RETENTION METRICS ===");
    rows.push(`Current Streak,${retentionMetrics.currentStreak}`);
    rows.push(`Longest Streak,${retentionMetrics.longestStreak}`);
    rows.push(`Total Active Days,${retentionMetrics.totalActiveDays}`);
    rows.push(`Avg Sessions Per Day,${retentionMetrics.avgSessionsPerDay.toFixed(2)}`);
    rows.push(`Total Games Played,${retentionMetrics.totalGamesPlayed}`);
    rows.push(`Total Stories Read,${retentionMetrics.totalStoriesRead}`);
    rows.push(`Total Brushing Sessions,${retentionMetrics.totalBrushingSessions}`);

    // Fetch children data for CSV
    const { data: children } = await supabase
      .from("children")
      .select("id, name, avatar_emoji, created_at")
      .eq("parent_id", user.id);

    for (const child of children || []) {
      rows.push("");
      rows.push(`=== CHILD: ${child.name} ===`);

      // Quest progress
      const { data: quests } = await supabase
        .from("quest_progress")
        .select("quest_id, xp_earned, completed_at")
        .eq("child_id", child.id);

      rows.push("Quest ID,XP Earned,Completed At");
      (quests || []).forEach((q) => {
        rows.push(`"${q.quest_id}",${q.xp_earned},"${q.completed_at}"`);
      });

      // Brushing sessions
      const { data: brushing } = await supabase
        .from("brushing_sessions")
        .select("session_type, duration_seconds, completed_at")
        .eq("child_id", child.id);

      rows.push("");
      rows.push("Session Type,Duration (seconds),Completed At");
      (brushing || []).forEach((b) => {
        rows.push(`"${b.session_type}",${b.duration_seconds},"${b.completed_at}"`);
      });

      // Game scores
      const { data: games } = await supabase
        .from("game_scores")
        .select("game_id, score, stars_earned, played_at")
        .eq("child_id", child.id);

      rows.push("");
      rows.push("Game ID,Score,Stars Earned,Played At");
      (games || []).forEach((g) => {
        rows.push(`"${g.game_id}",${g.score},${g.stars_earned},"${g.played_at}"`);
      });
    }

    return rows.join("\n");
  }, [user, analyticsEvents, retentionMetrics]);

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = useCallback(async () => {
    const data = await exportAsJSON();
    downloadFile(data, `toothyquest-data-${new Date().toISOString().split("T")[0]}.json`, "application/json");
  }, [exportAsJSON]);

  const handleExportCSV = useCallback(async () => {
    const data = await exportAsCSV();
    downloadFile(data, `toothyquest-data-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  }, [exportAsCSV]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalyticsEvents(), calculateRetentionMetrics()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAnalyticsEvents, calculateRetentionMetrics]);

  return {
    analyticsEvents,
    retentionMetrics,
    loading,
    handleExportJSON,
    handleExportCSV,
    refreshData: async () => {
      await Promise.all([fetchAnalyticsEvents(), calculateRetentionMetrics()]);
    },
  };
};
