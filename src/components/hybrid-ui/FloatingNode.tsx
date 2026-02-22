import { motion } from "framer-motion";
import { Star, Lock, Check, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type FloatingNodeStatus = "active" | "completed" | "unlocked" | "locked";

interface FloatingNodeProps {
  /** Emoji or icon to display */
  emoji?: string;
  icon?: LucideIcon;
  /** Node status controls appearance */
  status?: FloatingNodeStatus;
  /** Stagger delay for entrance animation */
  delay?: number;
  /** Floating animation intensity (0 = none) */
  floatIntensity?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Click handler */
  onClick?: () => void;
  /** Whether this node is selected/focused */
  isSelected?: boolean;
  /** Optional reward preview (emoji) */
  reward?: string;
  /** Optional label below node */
  label?: string;
  /** Optional "new" indicator */
  isNew?: boolean;
  /** Background image for the node */
  backgroundImage?: string;
  /** Additional className */
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  sm: { node: "w-14 h-14", icon: "w-5 h-5", emoji: "text-2xl", label: "text-[10px]" },
  md: { node: "w-[68px] h-[68px]", icon: "w-7 h-7", emoji: "text-3xl", label: "text-xs" },
  lg: { node: "w-20 h-20", icon: "w-8 h-8", emoji: "text-4xl", label: "text-sm" },
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
      >
        {/* Ground shadow */}
        {status !== "locked" && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-[50%] bg-foreground/8 blur-sm" />
        )}

        <motion.button
          onClick={isInteractive ? onClick : undefined}
          disabled={!isInteractive}
          className={`relative ${s.node} rounded-full flex items-center justify-center transition-all overflow-hidden ${
            status === "completed"
              ? "bg-gradient-to-br from-star to-accent shadow-glow"
              : status === "active"
              ? "bg-gradient-to-br from-primary to-bubble shadow-playful"
              : status === "unlocked"
              ? "bg-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-card"
              : "bg-muted/35 backdrop-blur-sm border border-border/40 opacity-55"
          }`}
          whileHover={isInteractive ? { scale: 1.15 } : {}}
          whileTap={isInteractive ? { scale: 0.9 } : {}}
        >
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
          <span className="relative z-10">
            {status === "completed" ? (
              <Check className={`${s.icon} text-white`} strokeWidth={3} />
            ) : status === "locked" ? (
              <Lock className={`${s.icon} text-muted-foreground/50`} />
            ) : Icon ? (
              <Icon className={`${s.icon} text-primary-foreground drop-shadow-sm`} />
            ) : emoji ? (
              <span className={`${s.emoji} drop-shadow-sm`}>{emoji}</span>
            ) : (
              children
            )}
          </span>

          {/* Completed star badge */}
          {status === "completed" && (
            <motion.div
              className="absolute -top-1 -right-1 z-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.5, type: "spring" }}
            >
              <Star className="w-5 h-5 text-star fill-star drop-shadow" />
            </motion.div>
          )}

          {/* New badge */}
          {isNew && status !== "completed" && status !== "locked" && (
            <motion.div
              className="absolute -top-1.5 -right-1.5 z-20 bg-secondary text-secondary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6, type: "spring" }}
            >
              NEW
            </motion.div>
          )}

          {/* Reward preview badge */}
          {reward && status !== "completed" && status !== "locked" && (
            <motion.div
              className="absolute -top-1.5 -left-1.5 z-20 w-6 h-6 rounded-full bg-card shadow-card border border-border flex items-center justify-center text-xs"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.6, type: "spring" }}
            >
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
