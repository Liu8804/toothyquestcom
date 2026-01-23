/**
 * Haptic Feedback Utility for Mobile Devices
 * Provides tactile feedback for touch interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50],
  selection: 5,
};

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback
 * @param pattern - The haptic pattern to use
 */
export const triggerHaptic = (pattern: HapticPattern = 'light'): void => {
  if (!isHapticSupported()) return;
  
  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not allowed
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Trigger a custom haptic pattern
 * @param pattern - Custom vibration pattern (duration in ms, or array of durations)
 */
export const triggerCustomHaptic = (pattern: number | number[]): void => {
  if (!isHapticSupported()) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.debug('Custom haptic feedback not available:', error);
  }
};

/**
 * Stop any ongoing vibration
 */
export const stopHaptic = (): void => {
  if (!isHapticSupported()) return;
  
  try {
    navigator.vibrate(0);
  } catch (error) {
    console.debug('Could not stop haptic:', error);
  }
};
