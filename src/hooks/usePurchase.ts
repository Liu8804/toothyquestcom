import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const PRODUCT_ID = 'toothyquest_full_unlock';
export const FREE_QUEST_LIMIT = 5;
// Games are locked until 5 quests completed OR purchase made
export const QUESTS_REQUIRED_FOR_GAMES = 5;

interface PurchaseState {
  isPurchased: boolean;
  isLoading: boolean;
  isRestoring: boolean;
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
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isPurchased: false,
    isLoading: true,
    isRestoring: false,
  });

  // Check for existing purchase on mount
  useEffect(() => {
    checkPurchaseStatus();
  }, []);

  const checkPurchaseStatus = async () => {
    try {
      // Check local storage for purchase status
      // In a real app, this would verify with Apple's servers
      const purchased = localStorage.getItem(PRODUCT_ID) === 'true';
      setPurchaseState(prev => ({ ...prev, isPurchased: purchased, isLoading: false }));
    } catch (error) {
      console.error('Error checking purchase status:', error);
      setPurchaseState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const purchase = useCallback(async (): Promise<boolean> => {
    setPurchaseState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // This is where Apple IAP integration would happen
      // For native iOS apps using Capacitor/React Native:
      // await InAppPurchase.purchase(PRODUCT_ID);
      
      // For now, simulate successful purchase for development
      // In production, this would be replaced with actual IAP code
      console.log(`Initiating purchase for product: ${PRODUCT_ID}`);
      
      // Simulate purchase flow - in real app, this waits for Apple confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store purchase status locally (would be verified server-side in production)
      localStorage.setItem(PRODUCT_ID, 'true');
      
      setPurchaseState(prev => ({ ...prev, isPurchased: true, isLoading: false }));
      toast.success(purchaseMessages.purchaseSuccess, {
        icon: '🎉',
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseState(prev => ({ ...prev, isLoading: false }));
      toast.error('Purchase could not be completed. Please try again.');
      return false;
    }
  }, []);

  const restorePurchase = useCallback(async (): Promise<boolean> => {
    setPurchaseState(prev => ({ ...prev, isRestoring: true }));
    
    try {
      // This is where Apple IAP restore would happen
      // For native iOS apps using Capacitor/React Native:
      // const restored = await InAppPurchase.restorePurchases();
      // const hasFullUnlock = restored.some(p => p.productId === PRODUCT_ID);
      
      console.log(`Restoring purchases for product: ${PRODUCT_ID}`);
      
      // Simulate restore flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user has a valid purchase to restore
      // In a real app, this would check with Apple's servers
      const hasPreviousPurchase = localStorage.getItem(PRODUCT_ID) === 'true';
      
      if (hasPreviousPurchase) {
        setPurchaseState(prev => ({ ...prev, isPurchased: true, isRestoring: false }));
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
  }, []);

  const isContentLocked = useCallback((contentIndex: number, contentType: 'quest' | 'game' = 'quest', completedQuestsCount: number = 0): boolean => {
    if (purchaseState.isPurchased) return false;
    
    if (contentType === 'game') {
      // Games are locked until 5 quests completed OR purchase
      return completedQuestsCount < QUESTS_REQUIRED_FOR_GAMES;
    }
    
    // Quests after first 5 are locked
    return contentIndex >= FREE_QUEST_LIMIT;
  }, [purchaseState.isPurchased]);

  return {
    isPurchased: purchaseState.isPurchased,
    isLoading: purchaseState.isLoading,
    isRestoring: purchaseState.isRestoring,
    purchase,
    restorePurchase,
    isContentLocked,
  };
};
