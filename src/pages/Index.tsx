import HeroSection from "@/components/HeroSection";
import AdventuresSection from "@/components/AdventuresSection";
import FunFactsSection from "@/components/FunFactsSection";
import PreviewSection from "@/components/PreviewSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AdventuresSection />
      <FunFactsSection />
      <PreviewSection />
      <FooterSection />
    </main>
  );
};

export default Index;
