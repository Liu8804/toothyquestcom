import { motion, AnimatePresence } from "framer-motion";
import { ToothyMascot } from "./ToothyMascot";
import { CreditCard, Shield, Sparkles } from "lucide-react";

interface PaymentLoadingOverlayProps {
  isVisible: boolean;
}

const PaymentLoadingOverlay = ({ isVisible }: PaymentLoadingOverlayProps) => {
  const loadingMessages = [
    "Getting your adventure ready! 🎉",
    "Toothy is excited to see you! 🦷",
    "Preparing something special... ✨",
    "Almost there! 🚀",
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-primary/95 via-bubble/95 to-star/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 15, -15, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {["🦷", "⭐", "✨", "💎", "🌟", "👑", "🎉", "💫", "🏆", "🎮", "📖", "🎯"][i]}
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-6"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {/* Animated Toothy mascot */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ToothyMascot size="xl" mood="excited" />
            </motion.div>

            {/* Loading text */}
            <motion.div
              className="mt-6 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="font-display text-3xl font-bold text-white drop-shadow-lg">
                Taking you to checkout!
              </h2>
              
              {/* Rotating messages */}
              <motion.div
                className="h-8 overflow-hidden"
                key="messages"
              >
                <motion.div
                  animate={{
                    y: [0, -32, -64, -96, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                >
                  {loadingMessages.map((msg, i) => (
                    <p key={i} className="h-8 text-lg text-white/90 font-medium">
                      {msg}
                    </p>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Loading spinner with icons */}
            <motion.div
              className="mt-8 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.div
                className="p-4 rounded-full bg-white/30 backdrop-blur-sm"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <CreditCard className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>

            {/* Security badge */}
            <motion.div
              className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Shield className="w-4 h-4 text-mint" />
              <span className="text-sm text-white font-medium">
                Secure payment via Stripe
              </span>
            </motion.div>

            {/* Progress dots */}
            <motion.div
              className="mt-6 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentLoadingOverlay;
