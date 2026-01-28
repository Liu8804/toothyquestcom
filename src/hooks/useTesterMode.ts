import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TesterInfo {
  isTester: boolean;
  isActive: boolean;
  trialStartAt: string | null;
  trialEndAt: string | null;
  daysRemaining: number;
  welcomeShown: boolean;
  expiryShown: boolean;
}

interface TesterModeState {
  testerInfo: TesterInfo | null;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_TESTER_INFO: TesterInfo = {
  isTester: false,
  isActive: false,
  trialStartAt: null,
  trialEndAt: null,
  daysRemaining: 0,
  welcomeShown: false,
  expiryShown: false,
};

/**
 * Hook to manage tester mode status and actions
 */
export const useTesterMode = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<TesterModeState>({
    testerInfo: null,
    isLoading: true,
    error: null,
  });

  const fetchTesterInfo = useCallback(async () => {
    if (!user?.id || !session?.access_token) {
      setState({
        testerInfo: DEFAULT_TESTER_INFO,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Call the RPC function to get tester info
      const { data, error } = await supabase.rpc("get_tester_info");

      if (error) {
        // If no tester account exists, user is not a tester
        if (error.message.includes("No rows")) {
          setState({
            testerInfo: DEFAULT_TESTER_INFO,
            isLoading: false,
            error: null,
          });
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        const row = data[0];
        setState({
          testerInfo: {
            isTester: row.is_tester,
            isActive: row.is_active,
            trialStartAt: row.trial_start_at,
            trialEndAt: row.trial_end_at,
            daysRemaining: row.days_remaining,
            welcomeShown: row.welcome_shown,
            expiryShown: row.expiry_shown,
          },
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          testerInfo: DEFAULT_TESTER_INFO,
          isLoading: false,
          error: null,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch tester info";
      setState({
        testerInfo: DEFAULT_TESTER_INFO,
        isLoading: false,
        error: message,
      });
    }
  }, [user?.id, session?.access_token]);

  const markWelcomeShown = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from("tester_accounts")
        .update({ welcome_shown: true })
        .eq("user_id", user.id);

      setState((prev) => ({
        ...prev,
        testerInfo: prev.testerInfo
          ? { ...prev.testerInfo, welcomeShown: true }
          : null,
      }));
    } catch (error) {
      console.error("Failed to mark welcome shown:", error);
    }
  }, [user?.id]);

  const markExpiryShown = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from("tester_accounts")
        .update({ expiry_shown: true })
        .eq("user_id", user.id);

      setState((prev) => ({
        ...prev,
        testerInfo: prev.testerInfo
          ? { ...prev.testerInfo, expiryShown: true }
          : null,
      }));
    } catch (error) {
      console.error("Failed to mark expiry shown:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchTesterInfo();
  }, [fetchTesterInfo]);

  return {
    ...state.testerInfo,
    testerInfo: state.testerInfo,
    isLoading: state.isLoading,
    error: state.error,
    refreshTesterInfo: fetchTesterInfo,
    markWelcomeShown,
    markExpiryShown,
  };
};
