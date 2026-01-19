import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Lock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePurchase, FREE_QUEST_LIMIT, PRICING } from "@/hooks/usePurchase";
import PurchaseModal from "@/components/PurchaseModal";

const FreePreviewBanner = () => {
  const { isPurchased } = usePurchase();
  const [showPurchase, setShowPurchase] = useState(false);

  if (isPurchased) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-bubble/10 to-star/10 border-b border-primary/20"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left side - message */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl"
              >
                🎁
              </motion.div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-foreground">
                  Try {FREE_QUEST_LIMIT} Free Quests!
                </p>
                <p className="text-sm text-muted-foreground">
                  50+ quests, mini-games, and rewards await!
                </p>
              </div>
            </div>

            {/* Right side - CTA */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline-flex items-center gap-1">
                <Gift className="w-4 h-4" />
                First {FREE_QUEST_LIMIT} quests free
              </span>
              <Button
                onClick={() => setShowPurchase(true)}
                size="sm"
                className="bg-gradient-to-r from-primary to-bubble hover:opacity-90 text-white font-semibold shadow-lg"
              >
                <Lock className="w-4 h-4 mr-1" />
                Unlock All - {PRICING.monthly.label}/mo
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <PurchaseModal isOpen={showPurchase} onClose={() => setShowPurchase(false)} />
    </>
  );
};

export default FreePreviewBanner;
