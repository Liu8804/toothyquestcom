import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Heart, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTesterMode } from "@/hooks/useTesterMode";
import { usePurchaseContext } from "@/hooks/purchase/PurchaseProvider";

export const TesterExpiryModal = () => {
  const { isTester, isActive, expiryShown, markExpiryShown } = useTesterMode();
  const { purchase } = usePurchaseContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show expiry modal for testers whose trial has ended and haven't seen it
    if (isTester && !isActive && !expiryShown) {
      setIsOpen(true);
    }
  }, [isTester, isActive, expiryShown]);

  const handleClose = async () => {
    await markExpiryShown();
    setIsOpen(false);
  };

  const handleUpgrade = async () => {
    await markExpiryShown();
    await purchase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-muted via-background to-primary/5 border-2 border-muted">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mx-auto mb-4"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted flex items-center justify-center">
                <Clock className="w-10 h-10 text-muted-foreground" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Heart className="w-6 h-6 text-red-400" />
              </motion.div>
            </div>
          </motion.div>

          <DialogTitle className="text-2xl font-bold">
            Thanks for Testing! 💙
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Your 7-day full access trial has ended. We hope you and your little one had a blast brushing with ToothyQuest!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              You can continue with the free daily quests, or unlock everything forever:
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Crown className="w-5 h-5" />
              <span>Full access from $4.99/month</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>✨ All 67+ quests</p>
            <p>🎮 30+ mini-games</p>
            <p>🏆 Unlimited rewards</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Unlock Full Access
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-muted-foreground"
          >
            Continue with Free Quests
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
