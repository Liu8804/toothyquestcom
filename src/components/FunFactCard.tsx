import { motion } from "framer-motion";
import { FloatingNode } from "@/components/hybrid-ui";

interface FunFactCardProps {
  fact: string;
  emoji: string;
  index?: number;
}

export const FunFactCard = ({ fact, emoji, index = 0 }: FunFactCardProps) => {
  return (
    <motion.div
      className="flex flex-col items-center text-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <FloatingNode
        emoji={emoji}
        status="completed"
        delay={index * 0.1}
        floatIntensity={0.5}
        size="lg"
      />
      <p className="text-foreground font-medium leading-relaxed text-sm max-w-[200px]">
        {fact}
      </p>
    </motion.div>
  );
};

export default FunFactCard;
