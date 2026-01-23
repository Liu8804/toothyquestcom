import { useCallback } from 'react';
import { triggerHaptic, triggerCustomHaptic, isHapticSupported, type HapticPattern } from '@/lib/haptics';

/**
 * Hook for using haptic feedback in components
 */
export const useHapticFeedback = () => {
  const haptic = useCallback((pattern: HapticPattern = 'light') => {
    triggerHaptic(pattern);
  }, []);

  const customHaptic = useCallback((pattern: number | number[]) => {
    triggerCustomHaptic(pattern);
  }, []);

  const buttonPress = useCallback(() => {
    triggerHaptic('light');
  }, []);

  const success = useCallback(() => {
    triggerHaptic('success');
  }, []);

  const error = useCallback(() => {
    triggerHaptic('error');
  }, []);

  const selection = useCallback(() => {
    triggerHaptic('selection');
  }, []);

  return {
    haptic,
    customHaptic,
    buttonPress,
    success,
    error,
    selection,
    isSupported: isHapticSupported(),
  };
};

export default useHapticFeedback;
