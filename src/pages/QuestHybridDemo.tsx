import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import HybridQuestWorld from "@/components/prototype/HybridQuestWorld";

const QuestHybridDemo = () => (
  <div className="min-h-screen bg-background">
    <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
      <Link to="/">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </Link>
      <div>
        <h1 className="font-display text-lg font-bold text-foreground">Hybrid Quest World — Design Prototype</h1>
        <p className="text-xs text-muted-foreground">Floating + Guided • Rewards preview • Design review</p>
      </div>
      <div className="ml-auto px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold">
        PROTOTYPE
      </div>
    </div>
    <HybridQuestWorld />
  </div>
);

export default QuestHybridDemo;
