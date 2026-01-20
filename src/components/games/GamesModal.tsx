import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star, Trophy, Medal, Volume2, VolumeX, Crown, Lock, Unlock } from "lucide-react";
import { games, Game, globalGameText } from "@/data/games";
import GameCard from "./GameCard";
import PlaquePatrolGame from "./PlaquePatrolGame";
import ToothDefenderGame from "./ToothDefenderGame";
import FlossHeroGame from "./FlossHeroGame";
import SugarBugChaseGame from "./SugarBugChaseGame";
import BuildASmileGame from "./BuildASmileGame";
import QuestMatchGame from "./QuestMatchGame";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import DailyChallengeNotification from "@/components/DailyChallengeNotification";
import PurchaseModal from "@/components/PurchaseModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { useQuestProgress } from "@/hooks/useQuestProgress";

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId?: string;
}

const GamesModal = ({ isOpen, onClose, childId }: GamesModalProps) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; stars: number; score: number } | null>(null);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("games");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [challengeNotification, setChallengeNotification] = useState<{
    show: boolean;
    title: string;
    xp: number;
  } | null>(null);
  
  const { user } = useAuth();
  const { isPurchased, isContentLocked } = usePurchase();
  const { questProgress } = useQuestProgress();
  const completedQuestsCount = questProgress.length;
  const { 
    achievements, 
    earnedAchievements, 
    leaderboard, 
    saveScore, 
    fetchLeaderboard,
    getTotalStars,
    getHighScore 
  } = useGameProgress(childId);
  
  const { 
    playSound, 
    playWinFanfare, 
    playLoseSound, 
    playAchievementUnlock,
    isMuted, 
    toggleMute 
  } = useGameSounds();

  const { incrementProgress } = useDailyChallenges(childId);

  // Games follow the same locking rules as the rest of the app (test mode included)
  const areGamesLocked = isContentLocked(0, 'game', completedQuestsCount);
  
  const gamesWithLockStatus = games.map((game) => ({
    ...game,
    isLocked: areGamesLocked,
  }));

  useEffect(() => {
    if (isOpen && selectedGame) {
      fetchLeaderboard(selectedGame.id);
    }
  }, [isOpen, selectedGame, fetchLeaderboard]);

  const handleGameComplete = async (won: boolean, stars: number, score: number = 0) => {
    setGameResult({ won, stars, score });
    
    if (won) {
      playWinFanfare();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Save score if user is authenticated and has a child selected
      if (user && childId) {
        const newlyEarned = await saveScore(selectedGame!.id, score, stars);
        if (newlyEarned.length > 0) {
          setNewAchievements(newlyEarned);
          setTimeout(playAchievementUnlock, 500);
        }

        // Track daily challenge progress for games
        const challengeResult = await incrementProgress("game");
        if (challengeResult?.completed) {
          setTimeout(() => {
            setChallengeNotification({
              show: true,
              title: challengeResult.challengeTitle,
              xp: challengeResult.xpEarned,
            });
          }, 1500);
        }
      }
    } else {
      playLoseSound();
    }
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setGameResult(null);
    setNewAchievements([]);
  };

  const handlePlayAgain = () => {
    setGameResult(null);
    setNewAchievements([]);
  };

  const handleGameSelect = (game: Game, isLocked: boolean) => {
    if (isLocked) {
      setShowPurchaseModal(true);
      return;
    }
    playSound("tap");
    setSelectedGame(game);
    fetchLeaderboard(game.id);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    const gameProps = {
      game: selectedGame,
      onComplete: (won: boolean, stars: number) => handleGameComplete(won, stars, stars * 10),
    };

    switch (selectedGame.id) {
      case "plaque_patrol":
        return <PlaquePatrolGame {...gameProps} />;
      case "tooth_defender":
        return <ToothDefenderGame {...gameProps} />;
      case "floss_hero":
        return <FlossHeroGame {...gameProps} />;
      case "sugar_bug_chase":
        return <SugarBugChaseGame {...gameProps} />;
      case "build_a_smile":
        return <BuildASmileGame {...gameProps} />;
      case "quest_match":
        return <QuestMatchGame {...gameProps} />;
      default:
        return null;
    }
  };

  const currentLeaderboard = selectedGame ? leaderboard[selectedGame.id] || [] : [];

  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />
      <DailyChallengeNotification
        isOpen={challengeNotification?.show || false}
        challengeTitle={challengeNotification?.title || ""}
        xpEarned={challengeNotification?.xp || 0}
        onClose={() => setChallengeNotification(null)}
      />
      <PurchaseModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              {selectedGame && !gameResult ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGames}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Fun Games
                  </h2>
                  {user && childId && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-sm">
                      ⭐ {getTotalStars()} stars
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                {!isPurchased && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPurchaseModal(true)}
                    className="gap-2 text-primary border-primary hover:bg-primary/10"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="rounded-full"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Achievement Unlock Overlay */}
              <AnimatePresence>
                {newAchievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black/70"
                  >
                    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-8 rounded-3xl text-center text-white max-w-sm mx-4">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-6xl mb-4"
                      >
                        🏆
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
                      {newAchievements.map((ach, i) => (
                        <div key={i} className="flex items-center justify-center gap-2 mt-3">
                          <span className="text-3xl">{ach.emoji}</span>
                          <div>
                            <p className="font-bold">{ach.name}</p>
                            <p className="text-sm opacity-90">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => setNewAchievements([])}
                        className="mt-6 bg-white text-amber-600 hover:bg-white/90"
                      >
                        Awesome!
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Result Screen */}
              {gameResult && selectedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <motion.div
                    animate={{ 
                      rotate: gameResult.won ? [0, -10, 10, -10, 0] : 0,
                      scale: gameResult.won ? [1, 1.2, 1] : 1 
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-8xl mb-6"
                  >
                    {gameResult.won ? "🎉" : "😅"}
                  </motion.div>
                  
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {gameResult.won ? selectedGame.winMessage : selectedGame.loseMessage}
                  </h3>
                  
                  {gameResult.won && (
                    <>
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                i < gameResult.stars
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {globalGameText.starsEarned}
                      </p>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Trophy className="w-5 h-5" />
                        {selectedGame.badgeName}
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" onClick={handleBackToGames}>
                      Back to Games
                    </Button>
                    <Button onClick={handlePlayAgain}>
                      Play Again
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Active Game */}
              {selectedGame && !gameResult && (
                <div className="h-[60vh]">
                  {renderGame()}
                </div>
              )}

              {/* Game Selection with Tabs */}
              {!selectedGame && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="games" className="gap-2">
                      <span>🎮</span> Games
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="gap-2">
                      <span>🏆</span> Achievements
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="gap-2">
                      <span>👑</span> Leaderboard
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="games">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {gamesWithLockStatus.map((game, index) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onClick={() => handleGameSelect(game, game.isLocked || false)}
                          delay={index * 0.1}
                        />
                      ))}
                    </div>
                    
                    {/* Unlock All Games Banner - show when games are locked */}
                    {areGamesLocked && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-bubble/10 to-star/10 rounded-2xl border border-primary/20"
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-full">
                              <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">
                                All games locked
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Unlock the full adventure to play all games!
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setShowPurchaseModal(true)}
                            className="gap-2 bg-gradient-to-r from-primary to-star hover:opacity-90"
                          >
                            <Crown className="w-4 h-4" />
                            Unlock All
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="achievements">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => {
                        const isEarned = earnedAchievements.some(
                          e => e.achievement_id === achievement.id
                        );
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                              isEarned 
                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-400" 
                                : "bg-muted/50 border-border opacity-60"
                            }`}
                          >
                            <div className={`text-4xl ${!isEarned && "grayscale"}`}>
                              {achievement.emoji}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-foreground">{achievement.name}</h4>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                            {isEarned && (
                              <Medal className="w-6 h-6 text-yellow-500" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard">
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground mb-4">
                        Select a game to see its leaderboard
                      </p>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                        {games.map((game) => (
                          <Button
                            key={game.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedGame(game);
                              fetchLeaderboard(game.id);
                              setActiveTab("leaderboard");
                            }}
                            className="flex-col h-auto py-2"
                          >
                            <span className="text-2xl">{game.emoji}</span>
                            <span className="text-xs truncate w-full">{game.name}</span>
                          </Button>
                        ))}
                      </div>
                      
                      {selectedGame && currentLeaderboard.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-bold text-center mb-4">
                            {selectedGame.emoji} {selectedGame.name} Top Scores
                          </h4>
                          {currentLeaderboard.map((entry, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center gap-4 p-3 rounded-xl ${
                                index === 0 ? "bg-yellow-100 dark:bg-yellow-900/30" :
                                index === 1 ? "bg-gray-100 dark:bg-gray-800" :
                                index === 2 ? "bg-orange-100 dark:bg-orange-900/30" :
                                "bg-muted/50"
                              }`}
                            >
                              <div className="w-8 text-center font-bold">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                              </div>
                              <div className="text-2xl">{entry.avatar_emoji}</div>
                              <div className="flex-1 font-medium">{entry.child_name}</div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold">{entry.stars}</span>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                Score: {entry.score}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      {(!selectedGame || currentLeaderboard.length === 0) && !selectedGame && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Play games to appear on the leaderboard!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default GamesModal;
