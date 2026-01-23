import { motion } from "framer-motion";
import { Award, Star, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface QuizCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  childName?: string;
  quizTitle: string;
  starsEarned: number;
  date?: string;
}

const QuizCertificate = ({
  isOpen,
  onClose,
  childName = "Champion",
  quizTitle,
  starsEarned,
  date = new Date().toLocaleDateString(),
}: QuizCertificateProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      // Create a simple downloadable text certificate
      const certificateText = `
🦷 ToothyQuest Certificate of Achievement 🦷

This certifies that

★ ${childName} ★

has successfully completed the quiz:
"${quizTitle}"

Stars Earned: ${"⭐".repeat(starsEarned)}

Date: ${date}

Congratulations on becoming a Dental Knowledge Champion!

Keep smiling!
— Your friends at ToothyQuest
      `;

      const blob = new Blob([certificateText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ToothyQuest-Certificate-${childName.replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download certificate:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        {/* Certificate */}
        <div
          ref={certificateRef}
          className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-amber-900/30 rounded-3xl p-8 shadow-2xl border-4 border-amber-400/50"
        >
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-amber-500 rounded-tl-xl" />
          <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-amber-500 rounded-tr-xl" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-amber-500 rounded-bl-xl" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-amber-500 rounded-br-xl" />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Award className="w-16 h-16 mx-auto text-amber-500 mb-2" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold text-amber-800 dark:text-amber-200">
              🦷 Certificate of Achievement 🦷
            </h2>
          </div>

          {/* Body */}
          <div className="text-center space-y-4 mb-6">
            <p className="text-muted-foreground">This certifies that</p>
            
            <motion.h3
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-display text-3xl font-bold text-primary"
            >
              ⭐ {childName} ⭐
            </motion.h3>
            
            <p className="text-muted-foreground">
              has successfully completed the quiz
            </p>
            
            <p className="font-semibold text-lg text-foreground">
              "{quizTitle}"
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 py-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                >
                  <Star
                    className={`w-10 h-10 ${
                      i < starsEarned
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                        : "text-muted stroke-2"
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Awarded on {date}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-amber-300/50 pt-4">
            <p className="text-amber-700 dark:text-amber-300 font-medium mb-1">
              Keep smiling! 😊
            </p>
            <p className="text-sm text-muted-foreground">
              — Your friends at ToothyQuest
            </p>
          </div>

          {/* Confetti decoration */}
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-xl pointer-events-none"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 360],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {["✨", "🌟", "⭐", "🎉", "🦷"][i % 5]}
            </motion.span>
          ))}
        </div>

        {/* Download button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-4 gap-3"
        >
          <Button
            onClick={handleDownload}
            className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default QuizCertificate;
