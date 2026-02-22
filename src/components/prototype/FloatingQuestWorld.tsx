import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Lock, Check, Sparkles, Trophy, X } from "lucide-react";

const QUESTS = [
  { id: "q1", title: "Brushing Basics", emoji: "🪥", status: "completed" as const, xp: 50, shape: "island", color: "from-star/40 to-accent/30" },
  { id: "q2", title: "Floss Like a Boss", emoji: "🧵", status: "completed" as const, xp: 50, shape: "cloud", color: "from-star/40 to-accent/30" },
  { id: "q3", title: "Sugar Bug Battle", emoji: "🐛", status: "completed" as const, xp: 75, shape: "bubble", color: "from-star/40 to-accent/30" },
  { id: "q4", title: "Sparkle Shower", emoji: "✨", status: "active" as const, xp: 60, shape: "island", color: "from-primary/40 to-bubble/30" },
  { id: "q5", title: "Captain Floss", emoji: "🦸", status: "unlocked" as const, xp: 80, shape: "cloud", color: "from-mint/30 to-primary/20" },
  { id: "q6", title: "Cavity Castle", emoji: "🏰", status: "unlocked" as const, xp: 100, shape: "island", color: "from-mint/30 to-primary/20" },
  { id: "q7", title: "Tooth Fairy Trail", emoji: "🧚", status: "locked" as const, xp: 90, shape: "bubble", color: "from-muted to-muted" },
  { id: "q8", title: "Mouthwash Magic", emoji: "🌊", status: "locked" as const, xp: 70, shape: "cloud", color: "from-muted to-muted" },
  { id: "q9", title: "Smile Squad", emoji: "😁", status: "locked" as const, xp: 100, shape: "island", color: "from-muted to-muted" },
  { id: "q10", title: "Champion Smile", emoji: "🏆", status: "locked" as const, xp: 150, shape: "bubble", color: "from-muted to-muted" },
];

// Organic scattered positions — no grid, no path
const POSITIONS = [
  { x: 12, y: 8, scale: 1.1, delay: 0 },
  { x: 58, y: 5, scale: 0.95, delay: 0.15 },
  { x: 35, y: 18, scale: 1.05, delay: 0.25 },
  { x: 72, y: 20, scale: 1.15, delay: 0.1 },
  { x: 8, y: 32, scale: 1, delay: 0.3 },
  { x: 50, y: 35, scale: 1.1, delay: 0.2 },
  { x: 28, y: 48, scale: 0.9, delay: 0.35 },
  { x: 68, y: 50, scale: 1.05, delay: 0.4 },
  { x: 15, y: 62, scale: 1, delay: 0.45 },
  { x: 52, y: 65, scale: 1.2, delay: 0.5 },
];

const AMBIENT_ITEMS = [
  { emoji: "⭐", x: 45, y: 12, size: 14 },
  { emoji: "🌙", x: 88, y: 8, size: 18 },
  { emoji: "💫", x: 3, y: 22, size: 12 },
  { emoji: "✨", x: 82, y: 38, size: 14 },
  { emoji: "🌟", x: 40, y: 58, size: 12 },
  { emoji: "☁️", x: 90, y: 15, size: 28 },
  { emoji: "☁️", x: 2, y: 45, size: 24 },
  { emoji: "🦋", x: 85, y: 55, size: 16 },
  { emoji: "🌈", x: 42, y: 2, size: 22 },
  { emoji: "💎", x: 92, y: 68, size: 14 },
];

type QuestStatus = "completed" | "active" | "unlocked" | "locked";

const getFloatAnimation = (index: number) => ({
  y: [0, -8 - (index % 3) * 4, 0],
  x: [0, (index % 2 === 0 ? 3 : -3), 0],
  rotate: [0, (index % 2 === 0 ? 1.5 : -1.5), 0],
});

const IslandShape = ({ status, children }: { status: QuestStatus; children: React.ReactNode }) => (
  <div className="relative">
    {/* Island base */}
    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-[110%] h-4 rounded-[50%] ${
      status === "locked" ? "bg-muted-foreground/15" : "bg-[hsl(25_60%_55%_/_0.3)]"
    }`} />
    <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90%] h-3 rounded-[50%] ${
      status === "locked" ? "bg-muted-foreground/10" : "bg-[hsl(120_40%_50%_/_0.25)]"
    }`} />
    {children}
  </div>
);

const CloudShape = ({ status, children }: { status: QuestStatus; children: React.ReactNode }) => (
  <div className="relative">
    <div className={`absolute inset-0 rounded-[50%] blur-sm scale-110 ${
      status === "locked" ? "bg-muted/50" : "bg-white/40"
    }`} />
    <div className={`absolute -left-3 top-2 w-8 h-6 rounded-full ${
      status === "locked" ? "bg-muted/30" : "bg-white/25"
    }`} />
    <div className={`absolute -right-2 top-3 w-6 h-5 rounded-full ${
      status === "locked" ? "bg-muted/30" : "bg-white/25"
    }`} />
    {children}
  </div>
);

const BubbleShape = ({ status, children }: { status: QuestStatus; children: React.ReactNode }) => (
  <div className="relative">
    {/* Bubble highlight */}
    <div className={`absolute inset-0 rounded-full ${
      status === "locked" ? "" : "bg-gradient-to-br from-white/30 to-transparent"
    }`} />
    <div className={`absolute top-2 left-3 w-2 h-2 rounded-full ${
      status === "locked" ? "bg-muted-foreground/10" : "bg-white/50"
    }`} />
    {children}
  </div>
);

const ShapeWrapper = ({ shape, status, children }: { shape: string; status: QuestStatus; children: React.ReactNode }) => {
  switch (shape) {
    case "island": return <IslandShape status={status}>{children}</IslandShape>;
    case "cloud": return <CloudShape status={status}>{children}</CloudShape>;
    case "bubble": return <BubbleShape status={status}>{children}</BubbleShape>;
    default: return <>{children}</>;
  }
};

const QuestNode = ({
  quest,
  position,
  isSelected,
  onSelect,
}: {
  quest: typeof QUESTS[0];
  position: typeof POSITIONS[0];
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const isInteractive = quest.status !== "locked";

  return (
    <motion.div
      className="absolute z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      initial={{ scale: 0, opacity: 0, y: 30 }}
      animate={{
        scale: position.scale,
        opacity: 1,
        y: 0,
        ...getFloatAnimation(QUESTS.indexOf(quest)),
      }}
      transition={{
        scale: { delay: position.delay, type: "spring", stiffness: 150 },
        opacity: { delay: position.delay, duration: 0.4 },
        y: { delay: position.delay + 0.8, duration: 4 + (QUESTS.indexOf(quest) % 3), repeat: Infinity, ease: "easeInOut" },
        x: { delay: position.delay + 1, duration: 5 + (QUESTS.indexOf(quest) % 2) * 2, repeat: Infinity, ease: "easeInOut" },
        rotate: { delay: position.delay + 0.5, duration: 6, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <ShapeWrapper shape={quest.shape} status={quest.status}>
        <motion.button
          onClick={(e) => { e.stopPropagation(); if (isInteractive) onSelect(); }}
          disabled={!isInteractive}
          className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all ${
            quest.status === "completed"
              ? "bg-gradient-to-br from-star to-accent shadow-glow"
              : quest.status === "active"
              ? "bg-gradient-to-br from-primary to-bubble shadow-playful"
              : quest.status === "unlocked"
              ? "bg-card/90 backdrop-blur-sm border-2 border-primary/25 shadow-card"
              : "bg-muted/40 backdrop-blur-sm border border-border/50 opacity-60"
          }`}
          whileHover={isInteractive ? { scale: 1.15 } : {}}
          whileTap={isInteractive ? { scale: 0.9 } : {}}
        >
          {quest.status === "completed" ? (
            <Check className="w-7 h-7 text-white" strokeWidth={3} />
          ) : quest.status === "locked" ? (
            <Lock className="w-5 h-5 text-muted-foreground/60" />
          ) : (
            <span className="text-3xl drop-shadow-sm">{quest.emoji}</span>
          )}

          {/* Completed star */}
          {quest.status === "completed" && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: position.delay + 0.5, type: "spring" }}
            >
              <Star className="w-5 h-5 text-star fill-star drop-shadow" />
            </motion.div>
          )}

          {/* Active glow ring */}
          {quest.status === "active" && (
            <motion.div
              className="absolute inset-0 rounded-full border-[3px] border-primary/50"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Active sparkles */}
          {quest.status === "active" && (
            <>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${50 + Math.cos(i * 1.57) * 50}%`,
                    top: `${50 + Math.sin(i * 1.57) * 50}%`,
                  }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], y: [0, -12] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45 }}
                >
                  <Sparkles className="w-3 h-3 text-star" />
                </motion.div>
              ))}
            </>
          )}

          {/* Selection ring */}
          {isSelected && (
            <motion.div
              className="absolute inset-[-4px] rounded-full border-[3px] border-primary"
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            />
          )}
        </motion.button>

        {/* Title label */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: position.delay + 0.4 }}
        >
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
            quest.status === "completed" ? "bg-star/20 text-star" :
            quest.status === "active" ? "bg-primary/15 text-primary" :
            quest.status === "unlocked" ? "bg-card/70 text-foreground" :
            "bg-muted/30 text-muted-foreground/60"
          }`}>
            {quest.title}
          </span>
        </motion.div>
      </ShapeWrapper>
    </motion.div>
  );
};

const QuestDetailSheet = ({ quest, onClose }: { quest: typeof QUESTS[0]; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.9 }}
    className="fixed inset-x-4 bottom-6 z-50 max-w-md mx-auto bg-card/95 backdrop-blur-lg rounded-3xl p-5 shadow-float border border-border"
    onClick={(e) => e.stopPropagation()}
  >
    <button onClick={onClose} className="absolute top-3 right-4 text-muted-foreground hover:text-foreground">
      <X className="w-5 h-5" />
    </button>

    <div className="flex items-center gap-4 mb-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
        quest.status === "completed" ? "bg-gradient-to-br from-star/30 to-accent/20" :
        quest.status === "active" ? "bg-gradient-to-br from-primary/20 to-bubble/15" :
        "bg-muted/50"
      }`}>
        {quest.emoji}
      </div>
      <div>
        <h3 className="font-display font-bold text-foreground text-lg">{quest.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-star" />
          <span>{quest.xp} XP</span>
          <span className="mx-1">•</span>
          <span className={`capitalize font-medium ${
            quest.status === "completed" ? "text-star" :
            quest.status === "active" ? "text-primary" : "text-foreground"
          }`}>{quest.status}</span>
        </div>
      </div>
    </div>

    {quest.status === "completed" && (
      <div className="flex items-center justify-center gap-2 py-2 text-star font-display font-bold text-sm">
        <Trophy className="w-4 h-4" /> Quest Complete — Great job! ⭐
      </div>
    )}
    {quest.status === "active" && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-primary-foreground gradient-hero shadow-playful text-base"
      >
        Play Now ✨
      </motion.button>
    )}
    {quest.status === "unlocked" && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-2xl font-display font-bold text-foreground bg-muted hover:bg-muted/80 shadow-card text-base"
      >
        Start Quest 🚀
      </motion.button>
    )}
  </motion.div>
);

const FloatingQuestWorld = () => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const completedCount = QUESTS.filter(q => q.status === "completed").length;
  const totalXp = QUESTS.filter(q => q.status === "completed").reduce((s, q) => s + q.xp, 0);

  return (
    <div className="relative" onClick={() => setSelectedQuest(null)}>
      {/* Stats bar */}
      <div className="flex items-center justify-center gap-6 py-4 px-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-border">
          <Star className="w-4 h-4 text-star fill-star" />
          <span className="font-display font-bold text-sm text-foreground">{completedCount}/{QUESTS.length}</span>
          <span className="text-xs text-muted-foreground">Quests</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">{totalXp}</span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
      </div>

      {/* Floating world canvas */}
      <div
        className="relative mx-4 rounded-[2rem] overflow-hidden shadow-float"
        style={{ height: "min(75vh, 620px)" }}
      >
        {/* Dreamy sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_60%_75%)] via-[hsl(200_70%_82%)] to-[hsl(260_50%_85%)]" />

        {/* Soft radial glows */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 60%, hsl(var(--star-gold) / 0.25) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 90%, hsl(var(--sparkle-purple) / 0.2) 0%, transparent 50%)
          `
        }} />

        {/* Ambient floating elements */}
        {AMBIENT_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.size }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [0, -6 - (i % 3) * 3, 0],
              x: [0, (i % 2 === 0 ? 4 : -4), 0],
            }}
            transition={{
              duration: 5 + i * 0.7,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Quest nodes */}
        {QUESTS.map((quest, i) => (
          <QuestNode
            key={quest.id}
            quest={quest}
            position={POSITIONS[i]}
            isSelected={selectedQuest === quest.id}
            onSelect={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
          />
        ))}

        {/* Gentle vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 50%, hsl(220 40% 20% / 0.08) 100%)"
        }} />
      </div>

      {/* Quest detail sheet */}
      <AnimatePresence>
        {selectedQuest && (
          <QuestDetailSheet
            quest={QUESTS.find(q => q.id === selectedQuest)!}
            onClose={() => setSelectedQuest(null)}
          />
        )}
      </AnimatePresence>

      {/* Design notes */}
      <div className="mx-4 mt-6 mb-8 p-4 bg-card rounded-2xl shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground text-sm mb-3">Design Notes</h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">🏝️ <span><strong>3 shape variants</strong> — islands (earthy base), clouds (soft wispy), bubbles (glossy highlight) — adding visual variety</span></li>
          <li className="flex items-start gap-2">🎈 <span><strong>No fixed path</strong> — quests float organically at different speeds/depths, encouraging free exploration</span></li>
          <li className="flex items-start gap-2">✨ <span><strong>Active quest</strong> pulses with sparkles, making it the obvious "tap me" target for non-readers</span></li>
          <li className="flex items-start gap-2">🔒 <span><strong>Locked quests</strong> are faded & non-interactive — visible but clearly "not yet"</span></li>
          <li className="flex items-start gap-2">📱 <span><strong>Tap interaction</strong> — bottom sheet slides up with quest details & CTA</span></li>
          <li className="flex items-start gap-2">🎨 <span><strong>Dreamy sky palette</strong> — aligns with the toy-like philosophy while feeling magical</span></li>
        </ul>
      </div>
    </div>
  );
};

export default FloatingQuestWorld;
