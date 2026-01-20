import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type EntitlementState = {
  hasEntitlement: boolean;
  isLoading: boolean;
  error: string | null;
  checkedAt: string | null;
};

/**
 * Checks whether the current user has a manual entitlement row.
 * This is non-sensitive: we only expose boolean + timestamps.
 */
export const useEntitlementStatus = () => {
  const { user, session } = useAuth();

  const [state, setState] = useState<EntitlementState>({
    hasEntitlement: false,
    isLoading: true,
    error: null,
    checkedAt: null,
  });

  const refresh = useCallback(async () => {
    if (!user?.id || !session?.access_token) {
      setState({ hasEntitlement: false, isLoading: false, error: null, checkedAt: new Date().toISOString() });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase
        .from("manual_entitlements")
        .select("user_id, granted_at, granted_via")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setState({
        hasEntitlement: !!data,
        isLoading: false,
        error: null,
        checkedAt: new Date().toISOString(),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setState({ hasEntitlement: false, isLoading: false, error: message, checkedAt: new Date().toISOString() });
    }
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    hasEntitlement: state.hasEntitlement,
    entitlementLoading: state.isLoading,
    entitlementError: state.error,
    entitlementCheckedAt: state.checkedAt,
    refreshEntitlementStatus: refresh,
  };
};
