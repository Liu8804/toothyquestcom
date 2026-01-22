import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DENTAL_TOOL_CHARACTERS } from "@/data/dentalAdventureSeries";
import { useTranslation } from "react-i18next";

interface DentalToolsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DentalToolsGallery = ({ isOpen, onClose }: DentalToolsGalleryProps) => {
  const { i18n } = useTranslation();
  const isSpanish = i18n.language === "es";
  const [currentIndex, setCurrentIndex] = useState(0);

  const tool = DENTAL_TOOL_CHARACTERS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DENTAL_TOOL_CHARACTERS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? DENTAL_TOOL_CHARACTERS.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`bg-gradient-to-br ${tool.color} text-white`}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>

              <p className="text-sm text-white/80 mb-1">
                {isSpanish ? "Conoce a las Herramientas" : "Meet the Tools"}
              </p>
              <h2 className="font-display text-2xl font-bold">
                {isSpanish ? tool.nameEs : tool.name}
              </h2>
            </div>

            {/* Character display */}
            <div className="px-6 pb-6">
              <motion.div
                className="w-32 h-32 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-6"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-7xl">{tool.emoji}</span>
              </motion.div>

              {/* Personality */}
              <div className="text-center mb-4">
                <p className="text-white/70 text-sm">
                  {isSpanish ? "Personalidad:" : "Personality:"}
                </p>
                <p className="font-bold">
                  {isSpanish ? tool.personalityEs : tool.personality}
                </p>
              </div>

              {/* Speech bubble */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative bg-white rounded-2xl p-4 text-foreground"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                <p className="relative text-center font-medium italic">
                  "{isSpanish ? tool.introductionEs : tool.introduction}"
                </p>
              </motion.div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {DENTAL_TOOL_CHARACTERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-black/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <p className="text-sm text-white/80">
                {currentIndex + 1} / {DENTAL_TOOL_CHARACTERS.length}
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DentalToolsGallery;
