import { motion } from "framer-motion";
import { Trophy, Lock, Sparkles } from "lucide-react";
import { ACHIEVEMENT_BADGES, TOOTH_PETS, type AchievementBadge, type ToothPet } from "@/data/rewardsConfig";

interface TrophyCaseProps {
  unlockedBadges: string[];
  unlockedPets: string[];
  className?: string;
}

const TrophyCase = ({ unlockedBadges, unlockedPets, className = "" }: TrophyCaseProps) => {
  const badges = ACHIEVEMENT_BADGES.map(badge => ({
    ...badge,
    unlocked: unlockedBadges.includes(badge.id),
  }));

  const pets = TOOTH_PETS.map(pet => ({
    ...pet,
    unlocked: unlockedPets.includes(pet.id),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-2xl p-4 shadow-card ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-star to-accent">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-foreground">Trophy Case</h3>
          <p className="text-xs text-muted-foreground">
            {unlockedBadges.length}/{badges.length} badges • {unlockedPets.length}/{pets.length} pets
          </p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="mb-4">
        <h4 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-1">
          <span>🏅</span> Badges
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative aspect-square rounded-xl flex items-center justify-center ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.color}`
                  : 'bg-muted/50'
              }`}
              title={badge.unlocked ? `${badge.name}: ${badge.description}` : `Locked: ${badge.description}`}
            >
              {badge.unlocked ? (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="text-2xl"
                >
                  {badge.emoji}
                </motion.span>
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              
              {/* Sparkle effect for unlocked badges */}
              {badge.unlocked && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pets Section */}
      <div>
        <h4 className="font-display font-bold text-sm text-foreground mb-2 flex items-center gap-1">
          <span>🐾</span> Tooth Pets
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative aspect-square rounded-xl flex items-center justify-center ${
                pet.unlocked
                  ? pet.rarity === 'legendary'
                    ? 'bg-gradient-to-br from-star via-accent to-secondary'
                    : pet.rarity === 'rare'
                    ? 'bg-gradient-to-br from-primary to-bubble'
                    : 'bg-gradient-to-br from-mint to-primary/50'
                  : 'bg-muted/50'
              }`}
              title={pet.unlocked ? `${pet.name}: ${pet.description}` : `Locked: ${pet.unlockCondition}`}
            >
              {pet.unlocked ? (
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.1 }}
                  className="text-xl"
                >
                  {pet.emoji}
                </motion.span>
              ) : (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TrophyCase;
