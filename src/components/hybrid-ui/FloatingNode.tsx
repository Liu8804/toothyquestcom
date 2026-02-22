import { motion } from "framer-motion";
import { Star, Lock, Check, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

export type FloatingNodeStatus = "active" | "completed" | "unlocked" | "locked";

interface FloatingNodeProps {
  emoji?: string;
  icon?: LucideIcon;
  status?: FloatingNodeStatus;
  delay?: number;
  floatIntensity?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  isSelected?: boolean;
  reward?: string;
  label?: string;
  isNew?: boolean;
  backgroundImage?: string;
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  sm: { node: "w-16 h-16", icon: "w-5 h-5", emoji: "text-2xl", label: "text-[10px]" },
  md: { node: "w-20 h-20", icon: "w-7 h-7", emoji: "text-3xl", label: "text-xs" },
  lg: { node: "w-24 h-24", icon: "w-8 h-8", emoji: "text-4xl", label: "text-sm" },
};

const FloatingNode = ({
  emoji,
  icon: Icon,
  status = "unlocked",
  delay = 0,
  floatIntensity = 1,
  size = "md",
  onClick,
  isSelected = false,
  reward,
  label,
  isNew = false,
  backgroundImage,
  className = "",
  children,
}: FloatingNodeProps) => {
  const isInteractive = status !== "locked";
  const s = sizeMap[size];
  const { playSound } = useGameSounds();
  const { buttonPress, error: hapticError, success: hapticSuccess } = useHapticFeedback();

  const handleClick = () => {
    if (isInteractive) {
      playSound("tap");
      buttonPress();
      onClick?.();
    } else {
      playSound("locked");
      hapticError();
    }
  };

  // 3D tilt style per status
  const get3DStyle = () => {
    if (status === "locked") return {};
    return {
      perspective: "400px",
      transformStyle: "preserve-3d" as const,
    };
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0, opacity: 0, y: 20 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        scale: { delay, type: "spring", stiffness: 160 },
        opacity: { delay, duration: 0.4 },
      }}
    >
      {/* Floating bob animation wrapper */}
      <motion.div
        className="will-change-transform"
        animate={
          floatIntensity > 0
            ? {
                y: [0, -6 * floatIntensity, 0],
                x: [0, 3 * floatIntensity, 0],
              }
            : {}
        }
        transition={{
          y: { delay: delay + 0.8, duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { delay: delay + 1, duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={get3DStyle()}
      >
        {/* Ground shadow — elongated for 3D depth */}
        {status !== "locked" && (
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-[50%] bg-foreground/10 blur-md"
            animate={
              floatIntensity > 0
                ? { scaleX: [1, 0.85, 1], opacity: [0.12, 0.06, 0.12] }
                : {}
            }
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.button
          onClick={handleClick}
          disabled={!isInteractive}
          className={`relative ${s.node} rounded-full flex items-center justify-center transition-all overflow-hidden will-change-transform ${
            status === "completed"
              ? "shadow-[0_6px_20px_-4px_hsl(var(--star)/0.5),inset_0_-3px_6px_hsl(var(--star)/0.2),inset_0_2px_4px_hsl(0_0%_100%/0.3)]"
              : status === "active"
              ? "shadow-[0_6px_24px_-4px_hsl(var(--primary)/0.5),inset_0_-3px_6px_hsl(var(--primary)/0.15),inset_0_2px_4px_hsl(0_0%_100%/0.25)]"
              : status === "unlocked"
              ? "shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.1),inset_0_-2px_4px_hsl(var(--foreground)/0.05),inset_0_1px_3px_hsl(0_0%_100%/0.4)]"
              : "shadow-none"
          }`}
          style={{
            background:
              status === "completed"
                ? "linear-gradient(145deg, hsl(var(--star)), hsl(var(--accent)))"
                : status === "active"
                ? "linear-gradient(145deg, hsl(var(--primary)), hsl(var(--bubble)))"
                : status === "unlocked"
                ? "linear-gradient(145deg, hsl(var(--card) / 0.95), hsl(var(--muted)))"
                : "hsl(var(--muted) / 0.35)",
            border:
              status === "unlocked"
                ? "2px solid hsl(var(--primary) / 0.3)"
                : status === "locked"
                ? "1px solid hsl(var(--border) / 0.4)"
                : "none",
            opacity: status === "locked" ? 0.55 : 1,
          }}
          whileHover={isInteractive ? { scale: 1.15, rotateX: -5, rotateY: 5 } : {}}
          whileTap={isInteractive ? { scale: 0.9, rotateX: 3 } : {}}
        >
          {/* 3D highlight — top-left specular */}
          {status !== "locked" && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 35% 25%, hsl(0 0% 100% / 0.35), transparent 70%)",
              }}
            />
          )}

          {/* Background image */}
          {backgroundImage && status !== "locked" && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center rounded-full"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/50 to-transparent" />
            </>
          )}

          {/* Content */}
          <span className="relative z-10" style={{ filter: status !== "locked" ? "drop-shadow(0 2px 3px rgba(0,0,0,0.2))" : "none" }}>
            {status === "completed" && !backgroundImage ? (
              <Check className={`${s.icon} text-white`} strokeWidth={3} />
            ) : status === "locked" ? (
              <Lock className={`${s.icon} text-muted-foreground/50`} />
            ) : backgroundImage ? (
              null
            ) : Icon ? (
              <Icon className={`${s.icon} text-primary-foreground`} />
            ) : emoji ? (
              <span className={s.emoji}>{emoji}</span>
            ) : (
              children
            )}
          </span>

          {/* Completed star badge — 3D pop */}
          {status === "completed" && (
            <motion.div
              className="absolute -top-1 -right-1 z-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.5, type: "spring" }}
              style={{ filter: "drop-shadow(0 2px 4px hsl(var(--star) / 0.5))" }}
            >
              <Star className="w-5 h-5 text-star fill-star" />
            </motion.div>
          )}

          {/* New badge */}
          {isNew && status !== "completed" && status !== "locked" && (
            <motion.div
              className="absolute -top-1.5 -right-1.5 z-20 bg-secondary text-secondary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ boxShadow: "0 2px 8px hsl(var(--secondary) / 0.4)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6, type: "spring" }}
            >
              NEW
            </motion.div>
          )}

          {/* Reward preview badge — enhanced with 3D pill */}
          {reward && status !== "completed" && status !== "locked" && (
            <motion.div
              className="absolute -top-2 -left-2 z-20 px-1.5 py-0.5 rounded-full bg-gradient-to-br from-star/90 to-accent/90 text-white text-[9px] font-bold flex items-center gap-0.5"
              style={{
                boxShadow: "0 3px 10px hsl(var(--star) / 0.4), inset 0 1px 2px hsl(0 0% 100% / 0.3)",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6, type: "spring" }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {reward}
            </motion.div>
          )}

          {/* Active glow ring */}
          {status === "active" && (
            <motion.div
              className="absolute inset-0 rounded-full border-[3px] border-primary/50"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Active sparkles */}
          {status === "active" && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${50 + Math.cos(i * 1.57) * 55}%`,
                    top: `${50 + Math.sin(i * 1.57) * 55}%`,
                  }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [0, -10] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
                >
                  <Sparkles className="w-3 h-3 text-star" />
                </motion.div>
              ))}
            </>
          )}

          {/* Selection ring */}
          {isSelected && (
            <motion.div
              className="absolute inset-[-5px] rounded-full border-[3px] border-primary"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            />
          )}
        </motion.button>

        {/* Label */}
        {label && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.4 }}
          >
            <span
              className={`${s.label} font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                status === "completed"
                  ? "bg-star/20 text-star"
                  : status === "active"
                  ? "bg-primary/15 text-primary"
                  : status === "unlocked"
                  ? "bg-card/70 text-foreground"
                  : "bg-muted/25 text-muted-foreground/50"
              }`}
              style={{ textShadow: status !== "locked" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}
            >
              {label}
            </span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FloatingNode;
