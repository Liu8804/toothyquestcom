import { motion } from "framer-motion";
import { Shield, Heart } from "lucide-react";

const ParentTrustSection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-6 h-6" />
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Designed for Parents. Loved by Kids.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
            ToothyQuest is a kid-safe, ad-free experience created to help children build lifelong dental habits through positive reinforcement and play.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ParentTrustSection;
