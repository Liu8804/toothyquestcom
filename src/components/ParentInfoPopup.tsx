import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, Brain, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ParentInfoPopup = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const points = t("parentInfo.points", { returnObjects: true }) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-card/80 backdrop-blur-sm rounded-full border-primary/30 hover:bg-primary/10"
        >
          <Brain className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">{t("parentInfo.trigger")}</span>
          <span className="sm:hidden">🧠</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-background to-muted/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🧠
            </motion.div>
            {t("parentInfo.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Intro */}
          <div className="space-y-2">
            <p className="text-muted-foreground">{t("parentInfo.intro")}</p>
            <p className="text-foreground font-semibold text-lg">
              {t("parentInfo.introHighlight")}
            </p>
          </div>

          {/* Learning points */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {t("parentInfo.learnTitle")}
            </p>
            <ul className="space-y-2">
              {points.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground text-sm">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Conclusion */}
          <motion.div
            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-foreground font-medium">
                {t("parentInfo.conclusion")}
              </p>
            </div>
          </motion.div>

          {/* Close button */}
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {t("parentInfo.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentInfoPopup;
