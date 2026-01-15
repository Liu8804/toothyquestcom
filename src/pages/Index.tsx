import HeroSection from "@/components/HeroSection";
import AdventuresSection from "@/components/AdventuresSection";
import StoryModeSection from "@/components/StoryModeSection";
import FunFactsSection from "@/components/FunFactsSection";
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AdventuresSection />
      <StoryModeSection />
      <FunFactsSection />
      <PreviewSection />
      <FooterSection />
    </main>
  );
};

export default Index;
