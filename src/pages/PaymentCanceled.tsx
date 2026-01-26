import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-sky-100 rounded-full opacity-50" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Payment Canceled
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment was canceled. No worries – you can try again anytime to unlock ToothyQuest!
          </p>

          <p className="text-gray-500 mb-8 text-sm">
            ✨ Toothy is waiting for you to join the dental adventure!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="px-6 py-5 rounded-xl"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Go Back
            </Button>
            
            <Button
              onClick={() => navigate("/?unlock=true")}
              size="lg"
              className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold px-6 py-5 rounded-xl shadow-lg"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Try Again
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentCanceled;
