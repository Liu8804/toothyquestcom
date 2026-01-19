import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any cached purchase state to force refresh
    localStorage.removeItem("toothyquest_purchase_checked");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100 rounded-full opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-100 rounded-full opacity-50" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Thank You!
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>

          <p className="text-lg text-gray-600 mb-6">
            🦷✨ ToothyQuest is now unlocked! ✨🦷
          </p>

          <p className="text-gray-500 mb-8">
            Have fun learning about dental health with all our games, stories, and activities!
          </p>

          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold px-8 py-6 rounded-xl shadow-lg"
          >
            Start Playing
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
