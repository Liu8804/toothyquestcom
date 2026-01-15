import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AdventureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "teal" | "coral" | "purple" | "gold";
  delay?: number;
  onClick?: () => void;
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
};

export const AdventureCard = ({
  title,
  description,
  icon: Icon,
  color,
  delay = 0,
  onClick,
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
      className={`${styles.bg} rounded-3xl p-6 cursor-pointer shadow-float hover:shadow-playful transition-all duration-300`}
    >
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
