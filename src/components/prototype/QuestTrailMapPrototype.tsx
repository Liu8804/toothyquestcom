import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Lock, Check, MapPin, Sparkles, Trophy, Heart, Shield, Zap } from "lucide-react";

// Mock quest data for the prototype
const MOCK_QUESTS = [
  { id: "q1", title: "Brushing Basics", emoji: "🪥", status: "completed" as const },
  { id: "q2", title: "Floss Like a Boss", emoji: "🧵", status: "completed" as const },
  { id: "q3", title: "Sugar Bug Battle", emoji: "🐛", status: "completed" as const },
  { id: "q4", title: "Sparkle Shower", emoji: "✨", status: "current" as const },
  { id: "q5", title: "Captain Floss", emoji: "🦸", status: "unlocked" as const },
  { id: "q6", title: "Cavity Castle", emoji: "🏰", status: "locked" as const },
  { id: "q7", title: "Tooth Fairy Trail", emoji: "🧚", status: "locked" as const },
  { id: "q8", title: "Mouthwash Magic", emoji: "🌊", status: "locked" as const },
  { id: "q9", title: "Smile Squad", emoji: "😁", status: "locked" as const },
  { id: "q10", title: "Champion Smile", emoji: "🏆", status: "locked" as const },
];

const TRAIL_POSITIONS = [
  { x: 20, y: 6 },
  { x: 65, y: 12 },
  { x: 25, y: 19 },
  { x: 70, y: 26 },
  { x: 18, y: 33 },
  { x: 68, y: 40 },
  { x: 22, y: 47 },
  { x: 72, y: 54 },
  { x: 30, y: 62 },
  { x: 50, y: 70 },
];

const SCENERY = [
  { emoji: "🌳", x: 85, y: 8, size: "text-2xl" },
  { emoji: "🌻", x: 5, y: 15, size: "text-lg" },
  { emoji: "🍄", x: 90, y: 22, size: "text-lg" },
  { emoji: "🏠", x: 8, y: 28, size: "text-xl" },
  { emoji: "🌸", x: 88, y: 35, size: "text-lg" },
  { emoji: "⛰️", x: 5, y: 42, size: "text-2xl" },
  { emoji: "🦋", x: 92, y: 48, size: "text-lg" },
  { emoji: "🌈", x: 50, y: 3, size: "text-3xl" },
  { emoji: "☁️", x: 30, y: 1, size: "text-xl" },
  { emoji: "☁️", x: 75, y: 2, size: "text-2xl" },
  { emoji: "🌺", x: 92, y: 58, size: "text-lg" },
  { emoji: "🪴", x: 6, y: 55, size: "text-xl" },
];

interface QuestDetailProps {
  quest: typeof MOCK_QUESTS[0];
  onClose: () => void;
}

const QuestDetail = ({ quest, onClose }: QuestDetailProps) => {
  const isCompleted = quest.status === "completed";
  const isCurrent = quest.status === "current";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="absolute inset-x-4 bottom-4 z-30 bg-card rounded-3xl p-5 shadow-float border border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-3 right-4 text-muted-foreground text-lg">✕</button>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
          isCompleted ? "bg-gradient-to-br from-star/30 to-accent/30" :
          isCurrent ? "bg-gradient-to-br from-primary/20 to-bubble/20" :
          "bg-muted"
        }`}>
          {quest.emoji}
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground text-lg">{quest.title}</h3>
          <p className="text-sm text-muted-foreground">
            {isCompleted ? "⭐ Completed — 50 XP earned" : isCurrent ? "🎯 Ready to play!" : "🔓 Unlocked"}
          </p>
        </div>
      </div>
      {(isCurrent || quest.status === "unlocked") && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-2xl font-display font-bold text-primary-foreground gradient-hero shadow-playful"
        >
          Start Quest ✨
        </motion.button>
      )}
      {isCompleted && (
        <div className="flex items-center gap-2 justify-center text-sm text-star font-medium">
          <Trophy className="w-4 h-4" /> Quest Complete — Great job!
        </div>
      )}
    </motion.div>
  );
};

const QuestTrailMapPrototype = () => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const completedCount = MOCK_QUESTS.filter(q => q.status === "completed").length;

  const getNodeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-br from-star to-accent shadow-glow";
      case "current":
        return "bg-gradient-to-br from-primary to-bubble ring-4 ring-primary/40 shadow-playful";
      case "unlocked":
        return "bg-card border-2 border-primary/30 shadow-card";
      default:
        return "bg-muted/60 border-2 border-border";
    }
  };

  const svgPath = TRAIL_POSITIONS.map((p, i) =>
    `${i === 0 ? "M" : i % 2 === 1 ? "C" : "S"} ${p.x + 5}% ${p.y + 2}%`
  ).join(" ");

  // Build a smooth curve path
  const buildPath = () => {
    const pts = TRAIL_POSITIONS;
    let d = `M ${pts[0].x + 5} ${pts[0].y + 2}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx1 = prev.x + 5 + (curr.x + 5 - (prev.x + 5)) * 0.5;
      const cpy1 = prev.y + 2;
      const cpx2 = prev.x + 5 + (curr.x + 5 - (prev.x + 5)) * 0.5;
      const cpy2 = curr.y + 2;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x + 5} ${curr.y + 2}`;
    }
    return d;
  };

  return (
    <div className="relative select-none" onClick={() => setSelectedQuest(null)}>
      {/* Progress header */}
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Quest Trail Map
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount} of {MOCK_QUESTS.length} quests completed
        </p>
        {/* Mini progress bar */}
        <div className="mt-3 mx-auto max-w-xs h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / MOCK_QUESTS.length) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-star"
          />
        </div>
      </div>

      {/* Map container */}
      <div className="relative rounded-3xl overflow-hidden shadow-float" style={{ minHeight: 650 }}>
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200_90%_85%)] via-[hsl(120_50%_88%)] to-[hsl(45_60%_85%)]" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 30%, hsl(var(--star-gold)) 0%, transparent 40%)"
        }} />

        {/* Scenery decorations */}
        {SCENERY.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.size} pointer-events-none`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.05 * i, type: "spring" }}
          >
            {item.emoji === "🦋" ? (
              <motion.span
                animate={{ x: [0, 10, -5, 0], y: [0, -8, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {item.emoji}
              </motion.span>
            ) : (
              item.emoji
            )}
          </motion.div>
        ))}

        {/* Trail path SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--star-gold))" stopOpacity="0.8" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--sparkle-purple))" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <motion.path
            d={buildPath()}
            fill="none"
            stroke="url(#trailGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="3 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
          {/* Completed trail overlay (solid) */}
          <motion.path
            d={buildPath()}
            fill="none"
            stroke="hsl(var(--star-gold))"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: completedCount / MOCK_QUESTS.length }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
        </svg>

        {/* Quest nodes */}
        {MOCK_QUESTS.map((quest, index) => {
          const pos = TRAIL_POSITIONS[index];
          const isSelected = selectedQuest === quest.id;

          return (
            <motion.div
              key={quest.id}
              className="absolute z-10"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 * index, type: "spring", stiffness: 200 }}
            >
              {/* Quest label */}
              <motion.div
                className={`absolute ${index % 2 === 0 ? "left-[110%]" : "right-[110%]"} top-1/2 -translate-y-1/2 whitespace-nowrap`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 * index + 0.3 }}
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  quest.status === "completed" ? "bg-star/20 text-star" :
                  quest.status === "current" ? "bg-primary/15 text-primary" :
                  quest.status === "unlocked" ? "bg-card/80 text-foreground" :
                  "bg-muted/50 text-muted-foreground"
                }`}>
                  {quest.title.length > 14 ? quest.title.slice(0, 14) + "…" : quest.title}
                </span>
              </motion.div>

              {/* Node button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  if (quest.status !== "locked") setSelectedQuest(isSelected ? null : quest.id);
                }}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${getNodeStyle(quest.status)}`}
                whileHover={quest.status !== "locked" ? { scale: 1.15 } : {}}
                whileTap={quest.status !== "locked" ? { scale: 0.92 } : {}}
                animate={quest.status === "current" ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0.4)",
                    "0 0 0 12px hsl(var(--primary) / 0)",
                    "0 0 0 0 hsl(var(--primary) / 0)",
                  ],
                } : {}}
                transition={{ duration: 2, repeat: quest.status === "current" ? Infinity : 0 }}
              >
                {quest.status === "completed" ? (
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.12 * index + 0.2, type: "spring" }}
                  >
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </motion.div>
                ) : quest.status === "locked" ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <span className="text-2xl">{quest.emoji}</span>
                )}

                {/* Star badge for completed */}
                {quest.status === "completed" && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
                    transition={{ delay: 0.12 * index + 0.4, duration: 0.5 }}
                  >
                    <Star className="w-5 h-5 text-star fill-star drop-shadow-md" />
                  </motion.div>
                )}

                {/* Pulsing pin for current */}
                {quest.status === "current" && (
                  <motion.div
                    className="absolute -top-2 -right-1"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="w-6 h-6 text-secondary fill-secondary drop-shadow-md" />
                  </motion.div>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-primary"
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}
              </motion.button>

              {/* Sparkle particles around current quest */}
              {quest.status === "current" && (
                <>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${50 + Math.cos(i * 2.1) * 40}%`,
                        top: `${50 + Math.sin(i * 2.1) * 40}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        y: [0, -15],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                    >
                      <Sparkles className="w-3 h-3 text-star" />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          );
        })}

        {/* Finish flag */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-card/90 backdrop-blur-sm rounded-full shadow-float border border-star/30">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Trophy className="w-5 h-5 text-star" />
            </motion.div>
            <span className="font-display font-bold text-foreground text-sm">Champion Smile 🏆</span>
          </div>
        </motion.div>

        {/* Quest detail panel */}
        <AnimatePresence>
          {selectedQuest && (
            <QuestDetail
              quest={MOCK_QUESTS.find(q => q.id === selectedQuest)!}
              onClose={() => setSelectedQuest(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend / comparison note */}
      <div className="mt-6 p-4 bg-card rounded-2xl shadow-card border border-border">
        <h3 className="font-display font-bold text-foreground text-sm mb-2">Design Notes</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-star to-accent" /> Completed quests glow gold with a star badge</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-bubble ring-2 ring-primary/30" /> Current quest pulses with a map pin</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-card border border-primary/30" /> Unlocked quests are tappable</li>
          <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted/60 border border-border" /> Locked quests fade into the trail</li>
          <li className="mt-2 pt-2 border-t border-border">📱 Tap any unlocked node to see the quest detail sheet</li>
          <li>🗺️ Trail uses winding path with scenery for a storybook feel</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestTrailMapPrototype;
