import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { stories } from "@/data/stories";
import StoryCard from "@/components/StoryCard";
import StoryViewer from "@/components/StoryViewer";

const StoryModeSection = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const handleOpenStory = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    }
  };

  const handlePreviousStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  return (
    <section id="stories" className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-bold mb-4"
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 Story Mode</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Magical Tooth Tales
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our tooth friends on exciting adventures! Learn about dental care through fun stories that will make you smile! ✨
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              onClick={() => handleOpenStory(index)}
            />
          ))}
        </div>

        {/* Fun stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-primary">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Fun Stories</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-secondary">{stories.length}</div>
            <div className="text-sm text-muted-foreground">Lessons to Learn</div>
          </div>
          <div className="px-6 py-4 bg-card rounded-2xl shadow-card">
            <div className="text-3xl font-display font-bold text-accent">∞</div>
            <div className="text-sm text-muted-foreground">Smiles Created</div>
          </div>
        </motion.div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          story={stories[selectedStoryIndex]}
          currentIndex={selectedStoryIndex}
          totalStories={stories.length}
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}
    </section>
  );
};

export default StoryModeSection;
