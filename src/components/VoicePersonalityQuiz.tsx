import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  VoiceMood, 
  VOICE_MOODS, 
  getVoiceSettings, 
  saveVoiceSettings,
  getVoicePersonalityConfig 
} from "@/components/VoiceSettingsModal";
import { supabase } from "@/integrations/supabase/client";

interface VoicePersonalityQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (mood: VoiceMood) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  options: {
    text: string;
    emoji: string;
    mood: VoiceMood;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your favorite kind of story?",
    emoji: "📚",
    options: [
      { text: "Happy adventures with friends!", emoji: "🌈", mood: "happy" },
      { text: "Cozy bedtime stories", emoji: "🌙", mood: "calm" },
      { text: "Super exciting quests!", emoji: "🚀", mood: "excited" },
      { text: "Stories with funny characters", emoji: "🎪", mood: "silly" },
    ],
  },
  {
    id: 2,
    question: "When you brush your teeth, you feel like...",
    emoji: "🦷",
    options: [
      { text: "A happy helper making smiles!", emoji: "😊", mood: "happy" },
      { text: "A peaceful cloud floating", emoji: "☁️", mood: "calm" },
      { text: "A superhero fighting germs!", emoji: "🦸", mood: "excited" },
      { text: "A silly monster scaring bugs!", emoji: "👾", mood: "silly" },
    ],
  },
  {
    id: 3,
    question: "Pick your favorite animal friend!",
    emoji: "🐾",
    options: [
      { text: "A friendly puppy", emoji: "🐕", mood: "happy" },
      { text: "A cuddly bunny", emoji: "🐰", mood: "calm" },
      { text: "A brave lion", emoji: "🦁", mood: "excited" },
      { text: "A silly monkey", emoji: "🐵", mood: "silly" },
    ],
  },
  {
    id: 4,
    question: "What makes you smile the most?",
    emoji: "😄",
    options: [
      { text: "Dancing and singing!", emoji: "💃", mood: "happy" },
      { text: "Warm hugs", emoji: "🤗", mood: "calm" },
      { text: "Going on adventures!", emoji: "🏔️", mood: "excited" },
      { text: "Making funny faces!", emoji: "🤪", mood: "silly" },
    ],
  },
  {
    id: 5,
    question: "If you had a magic power, it would be...",
    emoji: "✨",
    options: [
      { text: "Making everyone happy!", emoji: "🌟", mood: "happy" },
      { text: "Helping friends feel calm", emoji: "💫", mood: "calm" },
      { text: "Flying super fast!", emoji: "⚡", mood: "excited" },
      { text: "Talking to animals!", emoji: "🗣️", mood: "silly" },
    ],
  },
];

const VoicePersonalityQuiz = ({ isOpen, onClose, onComplete }: VoicePersonalityQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<VoiceMood[]>([]);
  const [result, setResult] = useState<VoiceMood | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAnswer = (mood: VoiceMood) => {
    const newAnswers = [...answers, mood];
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const counts: Record<VoiceMood, number> = {
        happy: 0,
        excited: 0,
        calm: 0,
        silly: 0,
      };
      
      newAnswers.forEach((answer) => {
        counts[answer]++;
      });

      const winner = (Object.entries(counts) as [VoiceMood, number][])
        .sort((a, b) => b[1] - a[1])[0][0];
      
      setResult(winner);
      
      // Save to settings
      const settings = getVoiceSettings();
      saveVoiceSettings({ ...settings, personality: winner });
      
      onComplete?.(winner);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleTestVoice = async () => {
    if (!result || isPlaying) return;
    setIsPlaying(true);

    const moodConfig = getVoicePersonalityConfig(result);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(moodConfig.previewPhrase);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
        }
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text: moodConfig.previewPhrase,
            voiceId: moodConfig.voiceId,
            voiceSettings: {
              stability: moodConfig.stability,
              similarityBoost: moodConfig.similarityBoost,
              style: moodConfig.style,
              speed: moodConfig.speed,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Voice failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const resultMoodConfig = result ? getVoicePersonalityConfig(result) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-background via-primary/5 to-accent/10 border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span>Voice Mood Quiz!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key={`question-${currentQuestion}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Progress */}
                <div className="flex gap-1.5 mb-4">
                  {QUIZ_QUESTIONS.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-2 flex-1 rounded-full ${
                        idx <= currentQuestion ? "bg-primary" : "bg-muted"
                      }`}
                      initial={idx === currentQuestion ? { scale: 0.8 } : {}}
                      animate={idx === currentQuestion ? { scale: 1 } : {}}
                    />
                  ))}
                </div>

                {/* Question */}
                <div className="text-center mb-6">
                  <motion.span 
                    className="text-4xl block mb-3"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {QUIZ_QUESTIONS[currentQuestion].emoji}
                  </motion.span>
                  <h3 className="text-lg font-display font-bold text-foreground">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.mood)}
                      className="w-full p-4 rounded-2xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-3"
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-foreground">{option.text}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                {/* Celebration */}
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="space-y-2"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl"
                  >
                    🎉
                  </motion.div>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    Your Perfect Voice Mood Is...
                  </h3>
                </motion.div>

                {/* Result Card */}
                {resultMoodConfig && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`p-6 rounded-3xl bg-gradient-to-br ${resultMoodConfig.gradient} text-white shadow-lg`}
                  >
                    <span className="text-5xl block mb-3">{resultMoodConfig.emoji}</span>
                    <h4 className="text-2xl font-display font-bold mb-2">
                      {resultMoodConfig.name}
                    </h4>
                    <p className="text-white/90 text-sm">
                      {resultMoodConfig.description}
                    </p>
                  </motion.div>
                )}

                {/* Test Voice Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={handleTestVoice}
                    disabled={isPlaying}
                    className="gap-2 rounded-xl"
                    size="lg"
                  >
                    {isPlaying ? (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                          <Volume2 className="w-5 h-5" />
                        </motion.div>
                        Listening...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Hear Your Voice!
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3 pt-2"
                >
                  <Button
                    variant="outline"
                    onClick={handleRestart}
                    className="flex-1 gap-2 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 rounded-xl font-display font-bold"
                  >
                    Let's Go! 🚀
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoicePersonalityQuiz;
