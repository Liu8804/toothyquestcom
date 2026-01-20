import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AdminStats {
  total_users: number;
  total_children: number;
  total_badges: number;
  total_xp_earned: number;
  total_quests_completed: number;
  total_brushing_sessions: number;
}

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xp_required: number;
  quest_count_required: number;
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string | null;
  created_at: string;
}

interface Child {
  id: string;
  name: string;
  avatar_emoji: string | null;
  age_group: string;
  parent_id: string;
  created_at: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Log admin action
  const logAdminAction = useCallback(async (
    action: string,
    targetTable: string,
    targetId?: string,
    details?: Record<string, unknown>
  ) => {
    if (!user) return;

    await supabase
      .from("admin_audit_logs")
      .insert({
        admin_user_id: user.id,
        action,
        target_table: targetTable,
        target_id: targetId || null,
        details: details || null,
      } as never);
  }, [user]);

  // Fetch audit logs using secure function
  const fetchAuditLogs = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase.rpc("get_admin_audit_logs");

    if (!error && data) {
      setAuditLogs(data as unknown as AuditLog[]);
    }
  }, [isAdmin]);

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Use secure backend function (security definer) to avoid RLS issues
    const { data, error } = await supabase.rpc("is_admin");

    if (!error && data === true) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    setLoading(false);
  }, [user]);

  // Fetch admin statistics using secure function
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase.rpc("get_admin_stats");

    if (!error && data) {
      const statsData = Array.isArray(data) ? data[0] : data;
      setStats({
        total_users: Number(statsData.total_users) || 0,
        total_children: Number(statsData.total_children) || 0,
        total_badges: Number(statsData.total_badges) || 0,
        total_xp_earned: Number(statsData.total_xp_earned) || 0,
        total_quests_completed: Number(statsData.total_quests_completed) || 0,
        total_brushing_sessions: Number(statsData.total_brushing_sessions) || 0,
      });
    }
  }, [isAdmin]);

  // Fetch all badges
  const fetchBadges = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("quest_count_required", { ascending: true });

    if (!error && data) {
      setBadges(data);
    }
  }, [isAdmin]);

  // Fetch all users using audited function
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase.rpc("admin_get_all_profiles");

    if (!error && data) {
      setUsers(data as unknown as UserProfile[]);
    }
  }, [isAdmin]);

  // Fetch all children using audited function (returns age_group instead of birth_year)
  const fetchChildren = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase.rpc("admin_get_all_children");

    if (!error && data) {
      setChildren(data as unknown as Child[]);
    }
  }, [isAdmin]);

  // Add a new badge
  const addBadge = useCallback(async (badge: Omit<Badge, "id" | "created_at">) => {
    if (!isAdmin) return null;

    const { data, error } = await supabase
      .from("badges")
      .insert(badge)
      .select()
      .single();

    if (!error && data) {
      await logAdminAction("CREATE", "badges", data.id, { name: badge.name });
      await fetchBadges();
      return data;
    }
    return null;
  }, [isAdmin, fetchBadges, logAdminAction]);

  // Update a badge
  const updateBadge = useCallback(async (id: string, updates: Partial<Omit<Badge, "id" | "created_at">>) => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from("badges")
      .update(updates)
      .eq("id", id);

    if (!error) {
      await logAdminAction("UPDATE", "badges", id, updates as Record<string, unknown>);
      await fetchBadges();
      return true;
    }
    return false;
  }, [isAdmin, fetchBadges, logAdminAction]);

  // Delete a badge
  const deleteBadge = useCallback(async (id: string) => {
    if (!isAdmin) return false;

    // Get badge name before deleting for the audit log
    const badge = badges.find(b => b.id === id);

    const { error } = await supabase
      .from("badges")
      .delete()
      .eq("id", id);

    if (!error) {
      await logAdminAction("DELETE", "badges", id, { name: badge?.name });
      await fetchBadges();
      return true;
    }
    return false;
  }, [isAdmin, fetchBadges, logAdminAction, badges]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchBadges(), fetchUsers(), fetchChildren(), fetchAuditLogs()]);
  }, [fetchStats, fetchBadges, fetchUsers, fetchChildren, fetchAuditLogs]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      refreshData();
    }
  }, [isAdmin, refreshData]);

  return {
    isAdmin,
    loading,
    stats,
    badges,
    users,
    children,
    auditLogs,
    addBadge,
    updateBadge,
    deleteBadge,
    refreshData,
  };
};
