import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useTapSpeak } from "@/hooks/useAutoSpeak";
import { useMascotSounds } from "@/hooks/useMascotSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface TapButtonProps {
  /** Icon to display (emoji or component) */
  icon: React.ReactNode;
  /** What to say when tapped */
  speakText: string;
  /** Click handler */
  onClick?: () => void;
  /** Button color variant */
  variant?: "primary" | "secondary" | "success" | "warning";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Optional label (shown as small icon hint below) */
  hint?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class */
  className?: string;
}

/**
 * Kid-friendly tap button with voice feedback
 * - Large tap target
 * - Speaks when tapped
 * - Visual + haptic feedback
 * - No text required (icon-based)
 */
const TapButton = ({
  icon,
  speakText,
  onClick,
  variant = "primary",
  size = "md",
  hint,
  disabled = false,
  className = "",
}: TapButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const { speak } = useTapSpeak();
  const { playHappy } = useMascotSounds();
  const { haptic } = useHapticFeedback();

  const sizeClasses = {
    sm: "w-14 h-14 text-2xl",
    md: "w-20 h-20 text-3xl",
    lg: "w-28 h-28 text-4xl",
  };

  const variantClasses = {
    primary: "bg-gradient-to-br from-primary to-bubble shadow-primary/30",
    secondary: "bg-gradient-to-br from-secondary to-star shadow-secondary/30",
    success: "bg-gradient-to-br from-mint to-primary shadow-mint/30",
    warning: "bg-gradient-to-br from-star to-secondary shadow-star/30",
  };

  const handleTap = useCallback(() => {
    if (disabled) return;

    setIsPressed(true);
    setShowSparkle(true);
    haptic("light");
    playHappy();
    speak(speakText);

    setTimeout(() => setIsPressed(false), 200);
    setTimeout(() => setShowSparkle(false), 600);

    onClick?.();
  }, [disabled, haptic, playHappy, speak, speakText, onClick]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.button
        onClick={handleTap}
        disabled={disabled}
        className={`
          relative rounded-full flex items-center justify-center
          shadow-lg active:shadow-md transition-shadow
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? "opacity-50 grayscale" : ""}
        `}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={isPressed ? { rotate: [0, -5, 5, 0] } : {}}
      >
        {/* Icon */}
        <span className="relative z-10">{icon}</span>

        {/* Sparkle effect */}
        {showSparkle && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-lg pointer-events-none"
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                }}
                transition={{ duration: 0.5 }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-white/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Hint (emoji-based for non-readers) */}
      {hint && (
        <span className="text-lg opacity-60">{hint}</span>
      )}
    </div>
  );
};

export default TapButton;
