import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, Clock, Gamepad2, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTesterMode } from "@/hooks/useTesterMode";

export const TesterWelcomeModal = () => {
  const { isTester, isActive, welcomeShown, daysRemaining, markWelcomeShown } = useTesterMode();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show welcome modal for active testers who haven't seen it yet
    if (isTester && isActive && !welcomeShown) {
      setIsOpen(true);
    }
  }, [isTester, isActive, welcomeShown]);

  const handleClose = async () => {
    await markWelcomeShown();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-primary/20">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto mb-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gift className="w-10 h-10 text-primary-foreground" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Tester Mode! 🎉
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            You have <span className="font-bold text-primary">{daysRemaining} days</span> of full access to explore everything ToothyQuest has to offer!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm">All 67+ quests unlocked</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/10"
          >
            <Gamepad2 className="w-5 h-5 text-accent" />
            <span className="text-sm">30+ mini-games available</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
          >
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">All rewards & stickers</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-muted"
          >
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Trial ends in {daysRemaining} days
            </span>
          </motion.div>
        </div>

        <Button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Exploring!
        </Button>
      </DialogContent>
    </Dialog>
  );
};
