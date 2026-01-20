import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const PRODUCT_ID = 'prod_ToloozqRZM4fpp';
export const ANNUAL_PRODUCT_ID = 'prod_ToloWHHcJ4wnOm';
export const FREE_QUEST_LIMIT = 5;
export const QUESTS_REQUIRED_FOR_GAMES = 5;

// Test mode - set to true to unlock all content for testing
export const TEST_MODE_UNLOCK_ALL = false;

// Pricing configuration
export const PRICING = {
  monthly: {
    price: 4.99,
    priceId: 'price_1Sr8GsLk8GbX7sRHrXxv3rwu',
    label: '$4.99',
    period: 'one-time',
  },
  annual: {
    price: 49.99,
    priceId: 'price_1Sr8HELk8GbX7sRHab1rRdNJ',
    label: '$49.99',
    period: 'one-time',
    savings: '16%',
  },
  legacy: {
    price: 3.99,
    priceId: 'price_1SqsbxLk8GbX7sRHlqnZHOuD',
    label: '$3.99',
    period: 'one-time',
  },
};

interface PurchaseState {
  isPurchased: boolean;
  isLoading: boolean;
  isRestoring: boolean;
  isCheckingPurchase: boolean;
}

interface PurchaseMessages {
  purchaseSuccess: string;
  restoreSuccess: string;
  lockedContent: string;
}

export const purchaseMessages: PurchaseMessages = {
  purchaseSuccess: "Welcome to the full ToothyQuest adventure!",
  restoreSuccess: "Your previous purchase has been restored. Enjoy all quests!",
  lockedContent: "Complete the first 5 quests or unlock the full adventure to play this quest!",
};

export type PlanType = 'monthly' | 'annual';

export const usePurchase = () => {
  const { user, session } = useAuth();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isPurchased: false,
    isLoading: false,
    isRestoring: false,
    isCheckingPurchase: true,
  });

  useEffect(() => {
    // Only check purchase status if we have both user and a valid access token
    if (user && session?.access_token) {
      checkPurchaseStatus();
    } else {
      // No valid session - check local storage or default to not purchased
      const localPurchase = localStorage.getItem(`toothyquest_purchased_${user?.id || 'anonymous'}`) === 'true';
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: localPurchase, 
        isCheckingPurchase: false 
      }));
    }
  }, [user, session?.access_token]);

  const checkPurchaseStatus = async () => {
    // Double-check we have valid auth before making the call
    if (!user?.id || !session?.access_token) {
      const localPurchase = localStorage.getItem(`toothyquest_purchased_${user?.id || 'anonymous'}`) === 'true';
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: localPurchase, 
        isCheckingPurchase: false 
      }));
      return;
    }

    try {
      setPurchaseState(prev => ({ ...prev, isCheckingPurchase: true }));
      
      // First check for manual entitlements (promo codes, admin grants)
      const { data: entitlement } = await supabase
        .from("manual_entitlements")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (entitlement) {
        // User has a manual entitlement - they're unlocked!
        localStorage.setItem(`toothyquest_purchased_${user.id}`, 'true');
        setPurchaseState(prev => ({ 
          ...prev, 
          isPurchased: true, 
          isCheckingPurchase: false 
        }));
        return;
      }
      
      // Otherwise, check Stripe purchase
      const { data, error } = await supabase.functions.invoke('check-purchase', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        // Silently fall back to local storage for auth errors (user not logged in properly)
        const localPurchase = localStorage.getItem(`toothyquest_purchased_${user.id}`) === 'true';
        setPurchaseState(prev => ({ 
          ...prev, 
          isPurchased: localPurchase, 
          isCheckingPurchase: false 
        }));
        return;
      }

      const purchased = data?.purchased === true;
      
      if (purchased) {
        localStorage.setItem(`toothyquest_purchased_${user.id}`, 'true');
      }
      
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: purchased, 
        isCheckingPurchase: false 
      }));
    } catch (error) {
      // Silent fallback - don't log errors for unauthenticated users
      const localPurchase = localStorage.getItem(`toothyquest_purchased_${user?.id || 'anonymous'}`) === 'true';
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: localPurchase, 
        isCheckingPurchase: false 
      }));
    }
  };

  const purchase = useCallback(async (onLoadingStart?: () => void, planType: PlanType = 'monthly'): Promise<boolean> => {
    if (!session?.access_token) {
      toast.error('Please sign in to purchase ToothyQuest');
      return false;
    }

    setPurchaseState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { planType },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        onLoadingStart?.();
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = data.url;
        return true;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseState(prev => ({ ...prev, isLoading: false }));
      toast.error('Purchase could not be completed. Please try again.');
      return false;
    }
  }, [session]);

  const restorePurchase = useCallback(async (): Promise<boolean> => {
    if (!session?.access_token) {
      toast.error('Please sign in to restore your purchase');
      return false;
    }

    setPurchaseState(prev => ({ ...prev, isRestoring: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('check-purchase', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to check purchase');
      }

      const purchased = data?.purchased === true;
      
      if (purchased) {
        if (user?.id) {
          localStorage.setItem(`toothyquest_purchased_${user.id}`, 'true');
        }
        setPurchaseState(prev => ({ 
          ...prev, 
          isPurchased: true, 
          isRestoring: false 
        }));
        toast.success(purchaseMessages.restoreSuccess, {
          icon: '✨',
          duration: 5000,
        });
        return true;
      } else {
        setPurchaseState(prev => ({ ...prev, isRestoring: false }));
        toast.info('No previous purchases found.', {
          icon: '📋',
        });
        return false;
      }
    } catch (error) {
      console.error('Restore failed:', error);
      setPurchaseState(prev => ({ ...prev, isRestoring: false }));
      toast.error('Could not restore purchases. Please try again.');
      return false;
    }
  }, [session, user]);

  const isContentLocked = useCallback((contentIndex: number, contentType: 'quest' | 'game' = 'quest', completedQuestsCount: number = 0): boolean => {
    // Test mode unlocks everything
    if (TEST_MODE_UNLOCK_ALL) return false;

    // Games: require BOTH purchase + 5 completed quests
    if (contentType === 'game') {
      if (!purchaseState.isPurchased) return true;
      return completedQuestsCount < QUESTS_REQUIRED_FOR_GAMES;
    }

    // Quests: first 5 are free, rest require purchase
    if (purchaseState.isPurchased) return false;
    return contentIndex >= FREE_QUEST_LIMIT;
  }, [purchaseState.isPurchased]);

  const refreshPurchaseStatus = useCallback(() => {
    if (user && session) {
      checkPurchaseStatus();
    }
  }, [user, session]);

  return {
    isPurchased: purchaseState.isPurchased,
    isLoading: purchaseState.isLoading,
    isRestoring: purchaseState.isRestoring,
    isCheckingPurchase: purchaseState.isCheckingPurchase,
    purchase,
    restorePurchase,
    isContentLocked,
    refreshPurchaseStatus,
    refetchPurchase: refreshPurchaseStatus,
  };
};
