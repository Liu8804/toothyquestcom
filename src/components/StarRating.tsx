import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  count?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export const StarRating = ({ count = 5, size = "md" }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.4,
            delay: i * 0.1,
            type: "spring",
            stiffness: 200,
          }}
        >
          <Star
            className={`${sizeClasses[size]} text-star fill-star`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StarRating;
