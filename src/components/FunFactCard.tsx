import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface FunFactCardProps {
  fact: string;
  emoji: string;
  index: number;
}

export const FunFactCard = ({ fact, emoji, index }: FunFactCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-3xl p-6 shadow-card border-2 border-primary/10 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-wide">
              Fun Fact!
            </span>
          </div>
          <p className="text-foreground font-medium leading-relaxed">{fact}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FunFactCard;
