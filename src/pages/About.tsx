import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Shield, Copyright, BookOpen, Music, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'Back to Home')}
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🦷</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              About ToothyQuest
            </h1>
          </div>

          <div className="space-y-8">
            {/* About Section */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Our Mission
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ToothyQuest is an educational app designed to help children learn healthy dental habits through fun stories, interactive quizzes, and playful games.
                </p>
                <p>
                  All content in ToothyQuest — including stories, characters, quizzes, games, and learning activities — is original and created specifically for this app to support children's dental education in a fun, engaging, and age-appropriate way.
                </p>
                <p>
                  Our mission is to make oral health learning enjoyable for kids while giving parents confidence in the quality, safety, and educational value of the content.
                </p>
              </div>
            </section>

            {/* Content Ownership & Copyright */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Copyright className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Content Ownership & Copyright
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  All stories, characters, quizzes, games, illustrations, audio concepts, and educational materials available in ToothyQuest are original and exclusive to this app.
                </p>
                <p>
                  This content is protected by copyright and may not be copied, reproduced, distributed, modified, or reused without prior written permission.
                </p>
                <p className="font-semibold text-foreground">
                  © ToothyQuest. All rights reserved.
                </p>
              </div>
            </section>

            {/* Educational Disclaimer */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Educational Disclaimer
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ToothyQuest is an educational app created to support learning about dental hygiene and healthy habits. The content is provided for educational purposes only and does not replace professional dental advice, diagnosis, or treatment.
                </p>
                <p className="font-medium text-foreground">
                  For medical or dental concerns, please consult a licensed dental professional.
                </p>
              </div>
            </section>

            {/* Audio & Music Usage */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-mint/10 rounded-xl flex items-center justify-center">
                  <Music className="w-5 h-5 text-mint-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Audio & Music Usage
                </h2>
              </div>
              <p className="text-muted-foreground">
                Music, sound effects, and audio used in ToothyQuest are original, licensed, or royalty-free and are used in accordance with applicable usage rights.
              </p>
            </section>

            {/* Trust & Safety */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-star/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-star" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Trust & Safety
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ToothyQuest is designed with children and families in mind. The app follows privacy and safety standards appropriate for children's educational apps and does not sell personal data.
                </p>
                <p>
                  Parental involvement is encouraged.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-card rounded-2xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Contact Us
                </h2>
              </div>
              <p className="text-muted-foreground">
                If you have any questions about ToothyQuest, our content, or anything else, please reach out to us at{" "}
                <a href="mailto:hello@toothyquest.com" className="text-primary hover:underline">
                  hello@toothyquest.com
                </a>
              </p>
            </section>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/privacy" className="text-primary hover:underline flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary hover:underline flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
