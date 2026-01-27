import { useEffect, useCallback } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { useRiveMascot, MascotEvent } from "@/contexts/RiveMascotContext";

interface RiveMascotProps {
  src: string;
  stateMachine?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onTap?: () => void;
  // Map app events to Rive input names
  inputMapping?: Partial<Record<MascotEvent, string>>;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

// Default mapping from app events to Rive state machine input names
const defaultInputMapping: Partial<Record<MascotEvent, string>> = {
  idle: "idle",
  tapMascot: "tapMascot",
  brushingStarted: "brushingStarted",
  brushingComplete: "brushingComplete",
  questComplete: "questComplete",
  streakAchieved: "streakAchieved",
  levelUp: "levelUp",
  badgeEarned: "badgeEarned",
};

const RiveMascot = ({
  src,
  stateMachine = "ToothyStateMachine",
  size = "md",
  className = "",
  onTap,
  inputMapping = defaultInputMapping,
}: RiveMascotProps) => {
  const { currentEvent, clearEvent } = useRiveMascot();

  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  // Get state machine inputs for each mapped event
  const idleInput = useStateMachineInput(rive, stateMachine, inputMapping.idle || "idle");
  const tapInput = useStateMachineInput(rive, stateMachine, inputMapping.tapMascot || "tapMascot");
  const brushingStartedInput = useStateMachineInput(rive, stateMachine, inputMapping.brushingStarted || "brushingStarted");
  const brushingCompleteInput = useStateMachineInput(rive, stateMachine, inputMapping.brushingComplete || "brushingComplete");
  const questCompleteInput = useStateMachineInput(rive, stateMachine, inputMapping.questComplete || "questComplete");
  const streakInput = useStateMachineInput(rive, stateMachine, inputMapping.streakAchieved || "streakAchieved");
  const levelUpInput = useStateMachineInput(rive, stateMachine, inputMapping.levelUp || "levelUp");
  const badgeInput = useStateMachineInput(rive, stateMachine, inputMapping.badgeEarned || "badgeEarned");

  // Map events to their corresponding inputs
  const inputMap: Record<MascotEvent, typeof idleInput> = {
    idle: idleInput,
    tapMascot: tapInput,
    brushingStarted: brushingStartedInput,
    brushingComplete: brushingCompleteInput,
    questComplete: questCompleteInput,
    streakAchieved: streakInput,
    levelUp: levelUpInput,
    badgeEarned: badgeInput,
  };

  // React to global mascot events
  useEffect(() => {
    if (currentEvent && rive) {
      const input = inputMap[currentEvent];
      if (input) {
        // Handle different input types (trigger, boolean, number)
        if (typeof input.fire === "function") {
          input.fire();
        } else if (typeof input.value === "boolean") {
          input.value = true;
        }
      }
      clearEvent();
    }
  }, [currentEvent, rive, clearEvent]);

  const handleClick = useCallback(() => {
    // Fire tap animation
    if (tapInput) {
      if (typeof tapInput.fire === "function") {
        tapInput.fire();
      } else if (typeof tapInput.value === "boolean") {
        tapInput.value = true;
      }
    }
    onTap?.();
  }, [tapInput, onTap]);

  return (
    <div 
      className={`${sizeClasses[size]} cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <RiveComponent />
    </div>
  );
};

export default RiveMascot;
