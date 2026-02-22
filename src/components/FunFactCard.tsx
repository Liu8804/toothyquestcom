interface FunFactCardProps {
  fact: string;
  emoji: string;
}

export const FunFactCard = ({ fact, emoji }: FunFactCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/60 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0 mt-0.5">{emoji}</div>
        <p className="text-foreground font-medium leading-relaxed text-sm">{fact}</p>
      </div>
    </div>
  );
};

export default FunFactCard;
