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
  birth_year: number | null;
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

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user]);

  // Fetch admin statistics
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    // Fetch counts manually since RLS is now configured
    const [profilesRes, childrenRes, badgesRes, questProgressRes, brushingRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("children").select("id", { count: "exact", head: true }),
      supabase.from("badges").select("id", { count: "exact", head: true }),
      supabase.from("quest_progress").select("xp_earned"),
      supabase.from("brushing_sessions").select("id", { count: "exact", head: true }),
    ]);

    const totalXp = questProgressRes.data?.reduce((sum, q) => sum + q.xp_earned, 0) || 0;

    setStats({
      total_users: profilesRes.count || 0,
      total_children: childrenRes.count || 0,
      total_badges: badgesRes.count || 0,
      total_xp_earned: totalXp,
      total_quests_completed: questProgressRes.data?.length || 0,
      total_brushing_sessions: brushingRes.count || 0,
    });
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

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  }, [isAdmin]);

  // Fetch all children
  const fetchChildren = useCallback(async () => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setChildren(data);
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
      await fetchBadges();
      return data;
    }
    return null;
  }, [isAdmin, fetchBadges]);

  // Update a badge
  const updateBadge = useCallback(async (id: string, updates: Partial<Omit<Badge, "id" | "created_at">>) => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from("badges")
      .update(updates)
      .eq("id", id);

    if (!error) {
      await fetchBadges();
      return true;
    }
    return false;
  }, [isAdmin, fetchBadges]);

  // Delete a badge
  const deleteBadge = useCallback(async (id: string) => {
    if (!isAdmin) return false;

    const { error } = await supabase
      .from("badges")
      .delete()
      .eq("id", id);

    if (!error) {
      await fetchBadges();
      return true;
    }
    return false;
  }, [isAdmin, fetchBadges]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchBadges(), fetchUsers(), fetchChildren()]);
  }, [fetchStats, fetchBadges, fetchUsers, fetchChildren]);

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
    addBadge,
    updateBadge,
    deleteBadge,
    refreshData,
  };
};
