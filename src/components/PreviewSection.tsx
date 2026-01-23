import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import dentalOffice from "@/assets/friendly-dental-office.png";
import DentalOfficeTour from "@/components/DentalOfficeTour";

export const PreviewSection = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <>
      <section id="games" className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="relative">
              <div className="absolute inset-0 gradient-warm rounded-3xl blur-3xl opacity-20 scale-95" />
              <img
                src={dentalOffice}
                alt="A friendly, colorful dental office for kids"
                className="rounded-3xl shadow-float w-full"
              />
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-6 -right-6 bg-card rounded-2xl p-4 shadow-float hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Not Scary!</p>
                    <p className="text-sm text-muted-foreground">Just fun & friendly</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <span className="inline-block bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-bold mb-4">
              🏥 See What It's Like!
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Dentist is Your Friend!
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Did you know the dental office is designed just for kids like you? There are colorful chairs, 
              friendly helpers, and lots of fun things to see! The dentist wants to help keep your smile 
              bright and healthy.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Comfy chairs that move like magic!",
                "Special tiny mirrors to see your teeth",
                "Stickers and prizes for brave heroes",
                "Gentle tools that tickle, not hurt",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>

            <Button variant="coral" size="lg" onClick={() => setIsTourOpen(true)}>
              Explore the Office Tour!
            </Button>
          </motion.div>
        </div>
        </div>
      </section>

      <DentalOfficeTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  );
};

export default PreviewSection;
