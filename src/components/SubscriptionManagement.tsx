import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, ExternalLink, Loader2, CreditCard, HelpCircle, RefreshCw, CheckCircle, XCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { toast } from "sonner";

const SubscriptionManagement = () => {
  const { session, user } = useAuth();
  const { isPurchased, refreshPurchaseStatus, isCheckingPurchase } = usePurchase();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to manage your subscription");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to open customer portal");
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Could not open subscription management. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPurchase = async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to verify your purchase");
      return;
    }

    setIsVerifying(true);
    
    try {
      // Force re-check from Stripe
      const { data, error } = await supabase.functions.invoke("check-purchase", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to verify purchase");
      }

      if (data?.purchased) {
        // Update localStorage
        if (user?.id) {
          localStorage.setItem(`toothyquest_purchased_${user.id}`, 'true');
        }
        toast.success("🎉 Purchase verified! All content is now unlocked.", {
          duration: 5000,
        });
        // Refresh the hook state
        refreshPurchaseStatus();
      } else {
        toast.info("No active purchase found. If you recently purchased, please wait a moment and try again.", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Verify purchase error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Could not verify purchase. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-b from-card to-background">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            {isPurchased ? (
              <Crown className="w-6 h-6 text-primary" />
            ) : (
              <CreditCard className="w-6 h-6 text-primary" />
            )}
          </div>
          <CardTitle className="font-display text-xl">
            {isPurchased ? "Premium Unlocked! 🎉" : "Purchase Status"}
          </CardTitle>
          <CardDescription>
            {isPurchased 
              ? "You have full access to all quests, games, and stories"
              : "Verify your purchase or manage your subscription"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status indicator */}
          <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
            isPurchased 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          }`}>
            {isCheckingPurchase ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Checking status...</span>
              </>
            ) : isPurchased ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All content unlocked</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Limited access (free tier)</span>
              </>
            )}
          </div>

          {/* Verify Purchase Button - Always show */}
          <Button
            onClick={handleVerifyPurchase}
            disabled={isVerifying || isCheckingPurchase}
            className="w-full"
            variant={isPurchased ? "outline" : "default"}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verify Purchase
              </>
            )}
          </Button>

          {/* Manage Subscription - Only for purchased users */}
          {isPurchased && (
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {isPurchased 
              ? "Opens Stripe's secure customer portal"
              : "Click to check if your payment was processed"
            }
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionManagement;
