import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { useTesterMode } from "@/hooks/useTesterMode";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Badge displayed for active testers showing their trial status
 * Shows "Tester Mode — Day X of 7" format
 */
export const TesterBadge = () => {
  const { isTester, isActive, daysRemaining, isLoading } = useTesterMode();

  if (isLoading || !isTester || !isActive) return null;

  // Calculate current day (7 - daysRemaining + 1, but cap at 7)
  const currentDay = Math.min(7 - daysRemaining + 1, 7);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-xs font-medium text-purple-600 dark:text-purple-400"
          >
            <FlaskConical className="w-3 h-3" />
            <span>Tester Mode</span>
            <span className="text-muted-foreground">—</span>
            <span className="font-bold">Day {currentDay} of 7</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {daysRemaining > 0 
              ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left in your trial!` 
              : "Last day of your trial!"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
