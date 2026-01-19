import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const PRODUCT_ID = 'prod_ToVdXfL4456xpF';
export const FREE_QUEST_LIMIT = 5;
// Games are locked until 5 quests completed OR purchase made
export const QUESTS_REQUIRED_FOR_GAMES = 5;

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

export const usePurchase = () => {
  const { user, session } = useAuth();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isPurchased: false,
    isLoading: false,
    isRestoring: false,
    isCheckingPurchase: true,
  });

  // Check for existing purchase on mount and when user changes
  useEffect(() => {
    if (user && session) {
      checkPurchaseStatus();
    } else {
      // Check local storage as fallback for non-logged-in state
      const localPurchase = localStorage.getItem(`toothyquest_purchased_${user?.id || 'anonymous'}`) === 'true';
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: localPurchase, 
        isCheckingPurchase: false 
      }));
    }
  }, [user, session]);

  const checkPurchaseStatus = async () => {
    if (!session?.access_token) {
      setPurchaseState(prev => ({ ...prev, isCheckingPurchase: false }));
      return;
    }

    try {
      setPurchaseState(prev => ({ ...prev, isCheckingPurchase: true }));
      
      const { data, error } = await supabase.functions.invoke('check-purchase', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking purchase:', error);
        // Fall back to local storage
        const localPurchase = localStorage.getItem(`toothyquest_purchased_${user?.id}`) === 'true';
        setPurchaseState(prev => ({ 
          ...prev, 
          isPurchased: localPurchase, 
          isCheckingPurchase: false 
        }));
        return;
      }

      const purchased = data?.purchased === true;
      
      // Cache in local storage
      if (purchased && user?.id) {
        localStorage.setItem(`toothyquest_purchased_${user.id}`, 'true');
      }
      
      setPurchaseState(prev => ({ 
        ...prev, 
        isPurchased: purchased, 
        isCheckingPurchase: false 
      }));
    } catch (error) {
      console.error('Error checking purchase status:', error);
      setPurchaseState(prev => ({ ...prev, isCheckingPurchase: false }));
    }
  };

  const purchase = useCallback(async (): Promise<boolean> => {
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
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        setPurchaseState(prev => ({ ...prev, isLoading: false }));
        toast.info('Complete your payment in the new tab', {
          icon: '💳',
          duration: 5000,
        });
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
    if (purchaseState.isPurchased) return false;
    
    if (contentType === 'game') {
      // Games are locked until 5 quests completed OR purchase
      return completedQuestsCount < QUESTS_REQUIRED_FOR_GAMES;
    }
    
    // Quests after first 5 are locked
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
  };
};
