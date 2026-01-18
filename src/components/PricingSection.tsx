import { motion } from "framer-motion";
import { Check, Sparkles, Star, Gift, Lock, Unlock, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePurchase } from "@/hooks/usePurchase";
import { useState } from "react";
import PurchaseModal from "@/components/PurchaseModal";

const freeFeatures = [
  "5 FREE dental quests",
  "Meet Toothy mascot",
  "Basic brushing timer",
  "Fun facts & tips",
  "Safe kid-friendly environment",
];

const premiumFeatures = [
  "All 42 exciting quests",
  "Braces adventure bonus content",
  "Daily challenges & rewards",
  "Advanced games unlocked",
  "Parent progress dashboard",
  "Badges & achievements",
  "Multiple-choice questions & hints",
  "Colorful animations & celebrations",
];

export const PricingSection = () => {
  const { isPurchased, purchase, isLoading } = usePurchase();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
            💰 Simple Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Start Free, Unlock the Magic! ✨
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try 5 FREE quests, then unlock the full adventure for your little hero!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-muted hover:border-primary/30 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">Free Start</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" size="lg">
                  <Star className="w-5 h-5 mr-2" />
                  Start Free Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-primary shadow-float relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ BEST VALUE
                </span>
              </div>
              
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Unlock className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">Full Adventure</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$3.99</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  No subscriptions, no hidden fees!
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isPurchased ? (
                  <Button className="w-full" size="lg" disabled>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Already Unlocked! 🎉
                  </Button>
                ) : (
                  <Button 
                    variant="hero" 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={isLoading}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isLoading ? "Processing..." : "Unlock All 42 Quests - $3.99"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* App Store Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-6 font-medium">
            📱 Download the app for the best experience!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* App Store Button */}
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:opacity-90 transition-opacity group"
            >
              <Apple className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs opacity-80">Download on the</div>
                <div className="text-lg font-semibold -mt-1">App Store</div>
              </div>
            </a>
            
            {/* Google Play Button */}
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:opacity-90 transition-opacity group"
            >
              <Smartphone className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xs opacity-80">Get it on</div>
                <div className="text-lg font-semibold -mt-1">Google Play</div>
              </div>
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            🌟 Coming soon to App Store and Google Play!
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>COPPA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👨‍👩‍👧</span>
            <span>Parent Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>No Ads, No Tracking</span>
          </div>
        </motion.div>
      </div>

      <PurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
    </section>
  );
};

export default PricingSection;
