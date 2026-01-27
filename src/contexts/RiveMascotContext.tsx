import { createContext, useContext, useCallback, useState, ReactNode } from "react";

export type MascotEvent = 
  | "idle" 
  | "tapMascot" 
  | "brushingStarted" 
  | "brushingComplete"
  | "questComplete" 
  | "streakAchieved"
  | "levelUp"
  | "badgeEarned";

interface RiveMascotContextType {
  triggerEvent: (event: MascotEvent) => void;
  currentEvent: MascotEvent | null;
  clearEvent: () => void;
}

const RiveMascotContext = createContext<RiveMascotContextType | null>(null);

export const RiveMascotProvider = ({ children }: { children: ReactNode }) => {
  const [currentEvent, setCurrentEvent] = useState<MascotEvent | null>(null);

  const triggerEvent = useCallback((event: MascotEvent) => {
    setCurrentEvent(event);
    // Auto-clear after animation time (adjust based on your Rive animation durations)
    setTimeout(() => setCurrentEvent(null), 2000);
  }, []);

  const clearEvent = useCallback(() => {
    setCurrentEvent(null);
  }, []);

  return (
    <RiveMascotContext.Provider value={{ triggerEvent, currentEvent, clearEvent }}>
      {children}
    </RiveMascotContext.Provider>
  );
};

export const useRiveMascot = () => {
  const context = useContext(RiveMascotContext);
  if (!context) {
    throw new Error("useRiveMascot must be used within a RiveMascotProvider");
  }
  return context;
};
