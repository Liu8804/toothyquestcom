import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Lock, Check, Sparkles, Trophy, X, ChevronRight } from "lucide-react";
import HybridQuestNode from "./hybrid/HybridQuestNode";
import HybridTrailPath from "./hybrid/HybridTrailPath";
import HybridDetailSheet from "./hybrid/HybridDetailSheet";
import HybridRewardBurst from "./hybrid/HybridRewardBurst";

export interface HybridQuest {
  id: string;
  title: string;
  emoji: string;
  status: "completed" | "active" | "unlocked" | "locked";
  xp: number;
  reward?: string;
}

const QUESTS: HybridQuest[] = [
  { id: "q1", title: "Brushing Basics", emoji: "🪥", status: "completed", xp: 50, reward: "⭐" },
  { id: "q2", title: "Floss Like a Boss", emoji: "🧵", status: "completed", xp: 50, reward: "🏅" },
  { id: "q3", title: "Sugar Bug Battle", emoji: "🐛", status: "completed", xp: 75, reward: "🛡️" },
  { id: "q4", title: "Sparkle Shower", emoji: "✨", status: "active", xp: 60, reward: "💎" },
  { id: "q5", title: "Captain Floss", emoji: "🦸", status: "unlocked", xp: 80, reward: "🎖️" },
  { id: "q6", title: "Cavity Castle", emoji: "🏰", status: "unlocked", xp: 100, reward: "👑" },
  { id: "q7", title: "Tooth Fairy Trail", emoji: "🧚", status: "locked", xp: 90 },
  { id: "q8", title: "Mouthwash Magic", emoji: "🌊", status: "locked", xp: 70 },
  { id: "q9", title: "Smile Squad", emoji: "😁", status: "locked", xp: 100 },
  { id: "q10", title: "Champion Smile", emoji: "🏆", status: "locked", xp: 150 },
];

// Organic but gently guided positions — left-right zigzag flow
const POSITIONS = [
  { x: 18, y: 6 },
  { x: 62, y: 10 },
  { x: 30, y: 22 },
  { x: 70, y: 26 },
  { x: 14, y: 38 },
  { x: 55, y: 42 },
  { x: 35, y: 54 },
  { x: 72, y: 58 },
  { x: 20, y: 70 },
  { x: 58, y: 76 },
];

const AMBIENT = [
  { emoji: "🌙", x: 90, y: 5, size: 20 },
  { emoji: "☁️", x: 4, y: 14, size: 26 },
  { emoji: "🦋", x: 88, y: 35, size: 16 },
  { emoji: "☁️", x: 92, y: 50, size: 22 },
  { emoji: "🌈", x: 45, y: 0, size: 24 },
  { emoji: "💫", x: 5, y: 55, size: 14 },
  { emoji: "🌟", x: 85, y: 72, size: 14 },
];

const HybridQuestWorld = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const completed = QUESTS.filter(q => q.status === "completed").length;
  const totalXp = QUESTS.filter(q => q.status === "completed").reduce((s, q) => s + q.xp, 0);
  const activeIdx = QUESTS.findIndex(q => q.status === "active");

  const handleSelect = useCallback((id: string) => {
    const quest = QUESTS.find(q => q.id === id);
    if (quest && quest.status !== "locked") {
      setSelectedId(prev => prev === id ? null : id);
    }
  }, []);

  const selectedQuest = QUESTS.find(q => q.id === selectedId);

  return (
    <div className="relative" onClick={() => setSelectedId(null)}>
      {/* Stats bar */}
      <div className="flex items-center justify-center gap-4 py-4 px-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-border">
          <Star className="w-4 h-4 text-star fill-star" />
          <span className="font-display font-bold text-sm text-foreground">{completed}/{QUESTS.length}</span>
          <span className="text-xs text-muted-foreground">Quests</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-foreground">{totalXp}</span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-card border border-border">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-star to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completed / QUESTS.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-bold">{Math.round((completed / QUESTS.length) * 100)}%</span>
        </div>
      </div>

      {/* World canvas */}
      <div
        className="relative mx-3 rounded-[2rem] overflow-hidden shadow-float"
        style={{ height: "min(78vh, 660px)" }}
      >
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(215_65%_72%)] via-[hsl(195_70%_80%)] to-[hsl(270_45%_82%)]" />

        {/* Soft glows */}
        <div className="absolute inset-0 opacity-35" style={{
          backgroundImage: `
            radial-gradient(ellipse at 25% 25%, hsl(var(--primary) / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 55%, hsl(var(--star-gold) / 0.25) 0%, transparent 45%),
            radial-gradient(ellipse at 45% 85%, hsl(var(--sparkle-purple) / 0.2) 0%, transparent 50%)
          `
        }} />

        {/* Ambient floating decor */}
        {AMBIENT.map((item, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.size }}
            animate={{
              opacity: [0.15, 0.45, 0.15],
              y: [0, -6 - (i % 3) * 3, 0],
              x: [0, (i % 2 === 0 ? 4 : -4), 0],
            }}
            transition={{ duration: 5 + i * 0.8, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Trail connections between nodes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {QUESTS.slice(0, -1).map((quest, i) => (
            <HybridTrailPath
              key={`trail-${i}`}
              from={POSITIONS[i]}
              to={POSITIONS[i + 1]}
              status={quest.status}
              nextStatus={QUESTS[i + 1].status}
              index={i}
              isNextActive={i + 1 === activeIdx}
            />
          ))}
        </svg>

        {/* Quest nodes */}
        {QUESTS.map((quest, i) => (
          <HybridQuestNode
            key={quest.id}
            quest={quest}
            position={POSITIONS[i]}
            index={i}
            isSelected={selectedId === quest.id}
            onSelect={() => handleSelect(quest.id)}
          />
        ))}

        {/* Gentle vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 55%, hsl(220 40% 18% / 0.1) 100%)"
        }} />
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedQuest && (
          <HybridDetailSheet
            quest={selectedQuest}
            onClose={() => setSelectedId(null)}
            onPlay={() => setShowReward(true)}
          />
        )}
      </AnimatePresence>

      {/* Reward burst */}
      <AnimatePresence>
        {showReward && (
          <HybridRewardBurst onComplete={() => setShowReward(false)} />
        )}
      </AnimatePresence>

      {/* Design notes */}
      <div className="mx-4 mt-6 mb-8 p-4 bg-card rounded-2xl shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground text-sm mb-3">✨ Hybrid Quest World — Design Concept</h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">🎈 <span><strong>Floating nodes</strong> — each quest drifts gently, inviting taps and exploration</span></li>
          <li className="flex items-start gap-2">🌟 <span><strong>Glowing trail</strong> — soft dotted path between quests hints at progression without enforcing order</span></li>
          <li className="flex items-start gap-2">💫 <span><strong>Active quest beacon</strong> — the current quest pulses with sparkles and has animated trail arrows pointing to it</span></li>
          <li className="flex items-start gap-2">🎁 <span><strong>Reward preview</strong> — each quest shows what you'll earn, motivating completion</span></li>
          <li className="flex items-start gap-2">🔓 <span><strong>Gentle locking</strong> — locked quests are visible but muted, showing "what's ahead" without frustration</span></li>
          <li className="flex items-start gap-2">🎉 <span><strong>Celebration burst</strong> — tap "Play Now" to see the reward animation concept</span></li>
        </ul>
      </div>
    </div>
  );
};

export default HybridQuestWorld;
