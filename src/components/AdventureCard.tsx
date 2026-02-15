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
  backgroundImage?: string;
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
  backgroundImage,
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
      className={`${!backgroundImage ? styles.bg : ''} rounded-3xl cursor-pointer shadow-float hover:shadow-playful transition-all duration-300 relative overflow-hidden min-h-[200px]`}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 p-6 h-full flex flex-col ${backgroundImage ? 'justify-end' : ''}`}>
        {/* New indicator */}
        {isNew && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-white/90 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              New
            </span>
          </div>
        )}

        {!backgroundImage && (
          <div className={`${styles.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-4`}>
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
        )}
        
        <h3 className={`font-display text-xl font-bold mb-2 ${backgroundImage ? 'text-white drop-shadow-lg' : 'text-primary-foreground'}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${backgroundImage ? 'text-white/90 drop-shadow-md' : 'text-primary-foreground/80'}`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default AdventureCard;
