import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  FREE_QUEST_LIMIT,
  PlanType,
  TEST_MODE_UNLOCK_ALL,
  purchaseMessages,
} from "@/hooks/purchase/constants";

interface TesterInfo {
  isTester: boolean;
  isActive: boolean;
  daysRemaining: number;
}

interface PurchaseState {
  isPurchased: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  isCheckingPurchase: boolean;
  testerInfo: TesterInfo | null;
}

type PurchaseContextValue = {
  isPurchased: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  isCheckingPurchase: boolean;
  lastPurchaseCheckAt: string | null;
  testerInfo: TesterInfo | null;
  purchase: (onLoadingStart?: () => void, planType?: PlanType) => Promise<boolean>;
  restorePurchase: () => Promise<boolean>;
  isContentLocked: (contentIndex: number, contentType?: "quest" | "game", completedQuestsCount?: number) => boolean;
  refreshPurchaseStatus: () => void;
  refetchPurchase: () => void;
};

const PurchaseContext = createContext<PurchaseContextValue | undefined>(undefined);

export const PurchaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isPurchased: false,
    isLoading: false,
    isRestoring: false,
    isCheckingPurchase: true,
    testerInfo: null,
  });
  const [lastPurchaseCheckAt, setLastPurchaseCheckAt] = useState<string | null>(null);

  const checkPurchaseStatus = useCallback(async () => {
    // Double-check we have valid auth before making the call
    if (!user?.id || !session?.access_token) {
      const localPurchase =
        localStorage.getItem(`toothyquest_purchased_${user?.id || "anonymous"}`) === "true";
      setPurchaseState((prev) => ({ ...prev, isPurchased: localPurchase, isCheckingPurchase: false, testerInfo: null }));
      setLastPurchaseCheckAt(new Date().toISOString());
      return;
    }

    try {
      setPurchaseState((prev) => ({ ...prev, isCheckingPurchase: true }));

      // Admin bypass: admin accounts should always be unlocked (server-validated)
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (!adminError && isAdmin === true) {
        localStorage.setItem(`toothyquest_purchased_${user.id}`, "true");
        setPurchaseState((prev) => ({ ...prev, isPurchased: true, isCheckingPurchase: false, testerInfo: null }));
        setLastPurchaseCheckAt(new Date().toISOString());
        return;
      }

      // Check if user is an active tester (7-day trial)
      const { data: testerData } = await supabase.rpc("get_tester_info");
      if (testerData && testerData.length > 0 && testerData[0].is_active) {
        const tester = testerData[0];
        setPurchaseState((prev) => ({
          ...prev,
          isPurchased: true, // Grant full access during trial
          isCheckingPurchase: false,
          testerInfo: {
            isTester: true,
            isActive: tester.is_active,
            daysRemaining: tester.days_remaining,
          },
        }));
        setLastPurchaseCheckAt(new Date().toISOString());
        return;
      }

      // First check for manual entitlements (promo codes, admin grants)
      const { data: entitlement } = await supabase
        .from("manual_entitlements")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (entitlement) {
        localStorage.setItem(`toothyquest_purchased_${user.id}`, "true");
        setPurchaseState((prev) => ({ ...prev, isPurchased: true, isCheckingPurchase: false, testerInfo: null }));
        setLastPurchaseCheckAt(new Date().toISOString());
        return;
      }

      // Otherwise, check Stripe purchase
      const { data, error } = await supabase.functions.invoke("check-purchase", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        const localPurchase = localStorage.getItem(`toothyquest_purchased_${user.id}`) === "true";
        setPurchaseState((prev) => ({ ...prev, isPurchased: localPurchase, isCheckingPurchase: false, testerInfo: null }));
        setLastPurchaseCheckAt(new Date().toISOString());
        return;
      }

      const purchased = data?.purchased === true;
      if (purchased) {
        localStorage.setItem(`toothyquest_purchased_${user.id}`, "true");
      }

      setPurchaseState((prev) => ({ ...prev, isPurchased: purchased, isCheckingPurchase: false, testerInfo: null }));
      setLastPurchaseCheckAt(new Date().toISOString());
    } catch {
      const localPurchase =
        localStorage.getItem(`toothyquest_purchased_${user?.id || "anonymous"}`) === "true";
      setPurchaseState((prev) => ({ ...prev, isPurchased: localPurchase, isCheckingPurchase: false, testerInfo: null }));
      setLastPurchaseCheckAt(new Date().toISOString());
    }
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    // Only check purchase status if we have both user and a valid access token
    if (user && session?.access_token) {
      void checkPurchaseStatus();
    } else {
      const localPurchase =
        localStorage.getItem(`toothyquest_purchased_${user?.id || "anonymous"}`) === "true";
      setPurchaseState((prev) => ({ ...prev, isPurchased: localPurchase, isCheckingPurchase: false, testerInfo: null }));
      setLastPurchaseCheckAt(new Date().toISOString());
    }
  }, [user, session?.access_token, checkPurchaseStatus]);

  const purchase = useCallback(
    async (onLoadingStart?: () => void, planType: PlanType = "monthly"): Promise<boolean> => {
      if (!session?.access_token) {
        toast.error("Please sign in to purchase ToothyQuest");
        return false;
      }

      setPurchaseState((prev) => ({ ...prev, isLoading: true }));

      try {
        const { data, error } = await supabase.functions.invoke("create-payment", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: { planType },
        });

        if (error) throw new Error(error.message || "Failed to create checkout session");

        if (data?.url) {
          onLoadingStart?.();
          await new Promise((resolve) => setTimeout(resolve, 1500));
          window.location.href = data.url;
          return true;
        }
        throw new Error("No checkout URL received");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Purchase failed:", error);
        setPurchaseState((prev) => ({ ...prev, isLoading: false }));
        toast.error("Purchase could not be completed. Please try again.");
        return false;
      }
    },
    [session?.access_token]
  );

  const restorePurchase = useCallback(async (): Promise<boolean> => {
    if (!session?.access_token) {
      toast.error("Please sign in to restore your purchase");
      return false;
    }

    setPurchaseState((prev) => ({ ...prev, isRestoring: true }));

    try {
      const { data, error } = await supabase.functions.invoke("check-purchase", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message || "Failed to check purchase");

      const purchased = data?.purchased === true;

      if (purchased) {
        if (user?.id) localStorage.setItem(`toothyquest_purchased_${user.id}`, "true");

        setPurchaseState((prev) => ({ ...prev, isPurchased: true, isRestoring: false }));
        toast.success(purchaseMessages.restoreSuccess, { duration: 5000 });
        return true;
      }

      setPurchaseState((prev) => ({ ...prev, isRestoring: false }));
      toast.info("No previous purchases found.");
      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Restore failed:", error);
      setPurchaseState((prev) => ({ ...prev, isRestoring: false }));
      toast.error("Could not restore purchases. Please try again.");
      return false;
    }
  }, [session?.access_token, user?.id]);

  const isContentLocked = useCallback(
    (contentIndex: number, contentType: "quest" | "game" = "quest", _completedQuestsCount: number = 0): boolean => {
      if (TEST_MODE_UNLOCK_ALL) return false;
      if (purchaseState.isPurchased) return false;
      if (contentType === "game") return true;
      return contentIndex >= FREE_QUEST_LIMIT;
    },
    [purchaseState.isPurchased]
  );

  const refreshPurchaseStatus = useCallback(() => {
    if (user && session) {
      void checkPurchaseStatus();
    }
  }, [user, session, checkPurchaseStatus]);

  const value = useMemo<PurchaseContextValue>(
    () => ({
      isPurchased: purchaseState.isPurchased,
      isLoading: purchaseState.isLoading,
      isRestoring: purchaseState.isRestoring,
      isCheckingPurchase: purchaseState.isCheckingPurchase,
      lastPurchaseCheckAt,
      testerInfo: purchaseState.testerInfo,
      purchase,
      restorePurchase,
      isContentLocked,
      refreshPurchaseStatus,
      refetchPurchase: refreshPurchaseStatus,
    }),
    [
      purchaseState.isPurchased,
      purchaseState.isLoading,
      purchaseState.isRestoring,
      purchaseState.isCheckingPurchase,
      purchaseState.testerInfo,
      lastPurchaseCheckAt,
      purchase,
      restorePurchase,
      isContentLocked,
      refreshPurchaseStatus,
    ]
  );

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
};

export const usePurchaseContext = () => {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error("usePurchase must be used within a PurchaseProvider");
  return ctx;
};
