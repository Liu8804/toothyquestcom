import { motion } from "framer-motion";
import { FlaskConical, Clock } from "lucide-react";
import { useTesterMode } from "@/hooks/useTesterMode";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Badge displayed for active testers showing their trial status
 */
export const TesterBadge = () => {
  const { isTester, isActive, daysRemaining, isLoading } = useTesterMode();

  if (isLoading || !isTester || !isActive) return null;

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
            <span>Tester</span>
            <span className="flex items-center gap-0.5 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {daysRemaining}d
            </span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You have full access for {daysRemaining} more days!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
