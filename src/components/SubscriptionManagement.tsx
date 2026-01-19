import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, ExternalLink, Loader2, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { toast } from "sonner";

const SubscriptionManagement = () => {
  const { session } = useAuth();
  const { isPurchased } = usePurchase();
  const [isLoading, setIsLoading] = useState(false);

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

  if (!isPurchased) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-b from-card to-background">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-display text-xl">Subscription Management</CardTitle>
          <CardDescription>
            View payment history, update payment method, or manage your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Opens Stripe's secure customer portal
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionManagement;
