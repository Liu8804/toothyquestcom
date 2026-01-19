import { motion } from "framer-motion";
import { Check, Sparkles, Star, Gift, Lock, Unlock, Apple, Smartphone, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePurchase, PRICING } from "@/hooks/usePurchase";
import { useState } from "react";
import PurchaseModal from "@/components/PurchaseModal";
import PricingFAQ from "@/components/PricingFAQ";
import SubscriptionManagement from "@/components/SubscriptionManagement";

const freeFeatures = [
  "5 FREE dental quests",
  "Meet Toothy mascot",
  "Basic brushing timer",
  "Fun facts & tips",
  "Safe kid-friendly environment",
];

const premiumFeatures = [
  "50+ interactive quests & mini-games",
  "Points, badges, streaks & Tooth Pets",
  "Fun animations & celebrations",
  "Daily challenges & rewards",
  "Parent progress dashboard",
  "Motivation for healthy habits",
  "Safe & educational for ages 4-10",
];

export const PricingSection = () => {
  const { t } = useTranslation();
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
            Turn Dental Care into a Fun Adventure! ✨
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of kids exploring over 50+ quests, mini-games, and rewards in ToothyQuest!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-2 border-muted hover:border-primary/30 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Free Start</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-5">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
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

          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-primary shadow-float relative overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Unlock className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Monthly</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-primary">{PRICING.monthly.label}</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-5">
                  {premiumFeatures.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{feature}</span>
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
                    Subscribe Monthly
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Annual Plan - Best Value */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-accent shadow-float relative overflow-hidden bg-gradient-to-b from-accent/5 to-background">
              {/* Best Value badge */}
              <div className="absolute top-4 right-4">
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ BEST VALUE
                </span>
              </div>
              
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Annual</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-accent">{PRICING.annual.label}</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <p className="text-sm text-accent font-medium mt-1">
                  Save {PRICING.annual.savings}!
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-5">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-accent-foreground" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{feature}</span>
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
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                    size="lg"
                    onClick={() => setShowPurchaseModal(true)}
                    disabled={isLoading}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Subscribe Annually
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Why ToothyQuest Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center max-w-3xl mx-auto"
        >
          <h3 className="font-display text-2xl font-bold text-foreground mb-6">
            Why ToothyQuest is Worth It 🦷
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-foreground font-medium">✨ Over 50 quests keep kids engaged for months</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-foreground font-medium">📚 Each quest teaches important dental lessons</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-foreground font-medium">🎮 Gamified rewards make brushing exciting</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-foreground font-medium">🏆 Track progress & collect Tooth Pets</p>
            </div>
          </div>
        </motion.div>

        {/* App Store Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-6 font-medium">
            📱 Download the app for the best experience!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
          transition={{ delay: 0.6 }}
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

        {/* Subscription Management (for existing subscribers) */}
        <div className="mt-12">
          <SubscriptionManagement />
        </div>

        {/* FAQ Section */}
        <PricingFAQ />
      </div>

      <PurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
    </section>
  );
};

export default PricingSection;
