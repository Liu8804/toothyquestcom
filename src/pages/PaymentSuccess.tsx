import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, UserPlus, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import ConfettiCelebration from "@/components/ConfettiCelebration";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Clear any cached purchase state to force refresh
    localStorage.removeItem("toothyquest_purchase_checked");
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-sky-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti celebration */}
      {showConfetti && <ConfettiCelebration isActive={showConfetti} />}
      
      {/* Floating celebration emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{
              left: `${5 + i * 6}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.8],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {["🎉", "✨", "🦷", "⭐", "🎊", "💫", "🌟"][i % 7]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-100 rounded-full opacity-50" />
        <div className="absolute top-20 -left-6 w-16 h-16 bg-sky-100 rounded-full opacity-50" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <CheckCircle className="w-14 h-14 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          {/* Success heading */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <PartyPopper className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Payment Success!
            </h1>
            <PartyPopper className="w-6 h-6 text-yellow-500" />
          </div>

          {/* Thank you message */}
          <div className="bg-gradient-to-r from-sky-50 to-green-50 rounded-2xl p-4 mb-6">
            <p className="text-lg text-gray-700 font-medium mb-2">
              ✅ Thank you!
            </p>
            <p className="text-gray-600">
              ToothyQuest is now <span className="font-bold text-green-600">unlocked</span>!
            </p>
            <p className="text-gray-600">
              Your child's adventure begins! 🎉
            </p>
          </div>

          {/* Sparkles decoration */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-lg text-gray-600">🦷✨ All games, stories & activities unlocked! ✨🦷</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          {/* Save Progress Section */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-primary/10 to-bubble/10 rounded-2xl p-5 mb-6 border border-primary/20"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <UserPlus className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-800">Save Progress & Rewards</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Want to keep track of your child's achievements across devices? Create a free account!
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="lg"
                className="w-full bg-white hover:bg-primary/5 border-primary/30 text-primary font-semibold rounded-xl"
              >
                <UserPlus className="mr-2 w-4 h-4" />
                Create Account / Save Progress
              </Button>
            </motion.div>
          )}

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200"
            >
              <p className="text-green-700 font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Progress will be saved to your account!
              </p>
            </motion.div>
          )}

          {/* Start Playing Button */}
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg"
          >
            <span className="mr-2">🎮</span>
            Start Playing!
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default PaymentSuccess;
