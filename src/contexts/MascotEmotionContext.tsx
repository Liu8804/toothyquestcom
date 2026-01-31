import React, { createContext, useContext, ReactNode } from "react";
import { useMascotEmotion } from "@/hooks/useMascotEmotion";
import { MascotEmotion } from "@/components/mascot/MascotEmotionState";

interface MascotEmotionContextType {
  emotion: MascotEmotion;
  setEmotion: (emotion: MascotEmotion, temporary?: boolean) => void;
  isTemporary: boolean;
  triggerSuccess: () => void;
  triggerWow: () => void;
  triggerError: () => void;
  triggerHelp: () => void;
  triggerGotIt: () => void;
  triggerLoading: () => void;
  triggerLetsPlay: () => void;
  triggerLevelUp: () => void;
  triggerCelebrating: () => void;
  resetToIdle: () => void;
}

const MascotEmotionContext = createContext<MascotEmotionContextType | undefined>(undefined);

interface MascotEmotionProviderProps {
  children: ReactNode;
  defaultEmotion?: MascotEmotion;
  autoResetDelay?: number;
}

/**
 * Provider to share mascot emotion state across the app.
 * Wrap your app or specific sections with this provider.
 * 
 * Usage:
 * <MascotEmotionProvider>
 *   <App />
 * </MascotEmotionProvider>
 * 
 * Then in any component:
 * const { triggerSuccess, emotion } = useMascotEmotionContext();
 */
export const MascotEmotionProvider = ({ 
  children, 
  defaultEmotion = "idle",
  autoResetDelay = 3000 
}: MascotEmotionProviderProps) => {
  const emotionState = useMascotEmotion({ defaultEmotion, autoResetDelay });

  return (
    <MascotEmotionContext.Provider value={emotionState}>
      {children}
    </MascotEmotionContext.Provider>
  );
};

export const useMascotEmotionContext = () => {
  const context = useContext(MascotEmotionContext);
  if (context === undefined) {
    throw new Error("useMascotEmotionContext must be used within a MascotEmotionProvider");
  }
  return context;
};

export default MascotEmotionContext;
