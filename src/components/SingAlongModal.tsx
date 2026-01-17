import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  Loader2,
  Sparkles,
  Clock,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { songs, Song } from "@/data/songs";
import { toast } from "sonner";

interface SingAlongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SingAlongModal = ({ isOpen, onClose }: SingAlongModalProps) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = useCallback(async (song: Song) => {
    if (isLoading) return;
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSelectedSong(song);
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: song.lyrics,
            voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - child-friendly voice
            style: "singing"
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Failed to play audio");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play song:", error);
      toast.error("Failed to play song. Please try again!");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setSelectedSong(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-display">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span>🎶 ToothyQuest Sing Along!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Song Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedSong?.id === song.id 
                    ? "ring-4 ring-primary ring-offset-2" 
                    : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
                onClick={() => playSong(song)}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${song.color} opacity-90`} />
                <div className="relative z-10 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{song.emoji}</span>
                    {selectedSong?.id === song.id && isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : selectedSong?.id === song.id && isPlaying ? (
                      <Volume2 className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Play className="w-6 h-6 opacity-70" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1">{song.title}</h3>
                  <p className="text-sm opacity-90 mb-2">{song.mood}</p>
                  <div className="flex items-center gap-2 text-xs opacity-80">
                    <Clock className="w-3 h-3" />
                    <span>{song.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Song Lyrics Display */}
          <AnimatePresence mode="wait">
            {selectedSong && (
              <motion.div
                key={selectedSong.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl p-6 shadow-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedSong.emoji}</span>
                    <div>
                      <h3 className="font-display font-bold text-xl text-foreground">
                        {selectedSong.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedSong.useCase}</p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    variant={isPlaying ? "secondary" : "default"}
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Play Again
                      </>
                    )}
                  </Button>
                </div>

                {/* Lyrics with bouncing animation when playing */}
                <div className="bg-muted/50 rounded-xl p-6 relative overflow-hidden">
                  {isPlaying && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          initial={{ 
                            x: Math.random() * 100 + "%", 
                            y: "100%",
                            opacity: 0 
                          }}
                          animate={{ 
                            y: "-20%", 
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeOut"
                          }}
                        >
                          <Sparkles className="w-6 h-6 text-primary/40" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <pre className="font-display text-lg text-foreground whitespace-pre-wrap leading-relaxed text-center">
                    {selectedSong.lyrics}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>Sing along with Toothy!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info section */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🎧 <strong>Tip:</strong> Tap any song card to hear it sung! Sing along to make brushing and flossing more fun!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SingAlongModal;
