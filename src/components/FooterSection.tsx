import { motion } from "framer-motion";
import { Heart, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import ToothyMascot from "@/components/ToothyMascot";

export const FooterSection = () => {
  return (
    <footer className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <ToothyMascot size="sm" className="mx-auto mb-6" />
          
          <h3 className="font-display text-2xl font-bold text-foreground mb-4">
            Keep Going, Hero! 🌟
          </h3>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Every quest you complete helps you grow a healthier, stronger smile! 
            Don't forget your daily adventures—your teeth will thank you!
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-secondary fill-secondary" />
            <span>for little smiles everywhere</span>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 gradient-hero rounded-xl flex items-center justify-center">
                  <span className="text-sm">🦷</span>
                </div>
                <span className="font-display font-bold text-foreground">ToothyQuest</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <Link 
                to="/privacy" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Terms of Service
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              © 2026 ToothyQuest. Helping kids smile brighter.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;
