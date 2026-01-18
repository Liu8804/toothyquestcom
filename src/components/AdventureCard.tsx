import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AdventureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "teal" | "coral" | "purple" | "gold" | "mint";
  delay?: number;
  onClick?: () => void;
  isNew?: boolean;
}

const colorStyles = {
  teal: {
    bg: "gradient-hero",
    iconBg: "bg-primary-foreground/20",
  },
  coral: {
    bg: "gradient-warm",
    iconBg: "bg-primary-foreground/20",
  },
  purple: {
    bg: "gradient-adventure",
    iconBg: "bg-primary-foreground/20",
  },
  gold: {
    bg: "bg-accent",
    iconBg: "bg-accent-foreground/10",
  },
  mint: {
    bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    iconBg: "bg-white/20",
  },
};

export const AdventureCard = ({
  title,
  description,
  icon: Icon,
  color,
  delay = 0,
  onClick,
  isNew = false,
}: AdventureCardProps) => {
  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${styles.bg} rounded-3xl p-6 cursor-pointer shadow-float hover:shadow-playful transition-all duration-300 relative overflow-hidden`}
    >
      {/* New badge */}
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 z-10"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ✨ NEW
            </motion.span>
          </div>
        </motion.div>
      )}

      <div className={`${styles.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
        <Icon className="w-8 h-8 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
        {title}
      </h3>
      <p className="text-primary-foreground/80 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export default AdventureCard;
