import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AdminStatusState = {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  checkedAt: string | null;
};

/**
 * Server-validated admin status (no localStorage, no hardcoding).
 * Uses the `is_admin()` RPC which checks roles securely on the backend.
 */
export const useAdminStatus = () => {
  const { session } = useAuth();

  const [state, setState] = useState<AdminStatusState>({
    isAdmin: false,
    isLoading: true,
    error: null,
    checkedAt: null,
  });

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setState({ isAdmin: false, isLoading: false, error: null, checkedAt: new Date().toISOString() });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;

      setState({
        isAdmin: data === true,
        isLoading: false,
        error: null,
        checkedAt: new Date().toISOString(),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setState({ isAdmin: false, isLoading: false, error: message, checkedAt: new Date().toISOString() });
    }
  }, [session?.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    isAdmin: state.isAdmin,
    isAdminLoading: state.isLoading,
    adminError: state.error,
    adminCheckedAt: state.checkedAt,
    refreshAdminStatus: refresh,
  };
};
