import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Heart, Volume2, VolumeX, Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { useEffect } from "react";
import type { Story } from "@/data/stories";

interface StoryViewerProps {
  story: Story;
  currentIndex: number;
  totalStories: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer = ({
  story,
  currentIndex,
  totalStories,
  onClose,
  onNext,
  onPrevious,
}: StoryViewerProps) => {
  const { isPlaying, isLoading, isPaused, error, play, pause, resume, stop } = useStoryNarration();

  // Stop narration when story changes or modal closes
  useEffect(() => {
    return () => stop();
  }, [story.id, stop]);

  const handlePlayNarration = () => {
    const fullText = `${story.title}. ${story.story} What we learned: ${story.lesson}`;
    play(fullText);
  };

  const handleToggleNarration = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      handlePlayNarration();
    }
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-3xl shadow-float"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-card"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Story illustration */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary/20 to-bubble/30">
            <img
              src={story.illustrationPath}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-9xl">
              {story.emoji}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Story counter */}
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm font-display font-bold text-sm text-foreground shadow-card">
              Story {currentIndex + 1} of {totalStories}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title and Audio Controls */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{story.emoji}</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {story.title}
                </h2>
              </div>
              
              {/* Audio narration button */}
              <Button
                onClick={handleToggleNarration}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className={`rounded-full gap-2 transition-all ${
                  isPlaying ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </>
                ) : isPlaying && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="hidden sm:inline">Pause</span>
                    {/* Animated sound waves */}
                    <div className="flex items-center gap-0.5 ml-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-primary-foreground rounded-full"
                          animate={{ height: [4, 12, 4] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Resume</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Listen</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-xl text-sm flex items-center gap-2">
                <VolumeX className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Story text */}
            <div className="relative mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl leading-relaxed text-foreground/90 font-sans"
              >
                {story.story}
              </motion.div>
              
              {/* Decorative sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -top-2 -right-2 text-star opacity-60"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </div>

            {/* Lesson box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-secondary fill-secondary" />
                <span className="font-display font-bold text-primary">What we learned:</span>
              </div>
              <p className="text-foreground/80 font-medium">{story.lesson}</p>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-2xl"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Progress dots */}
              <div className="flex gap-2">
                {Array.from({ length: totalStories }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "w-6 bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={onNext}
                disabled={currentIndex === totalStories - 1}
                className="flex items-center gap-2 rounded-2xl"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
