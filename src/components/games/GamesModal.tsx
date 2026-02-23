import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star, Trophy, Medal, Volume2, VolumeX, Crown, Lock, Unlock, Sparkles } from "lucide-react";
import MascotEmotionState from "@/components/mascot/MascotEmotionState";
import { useMascotEmotionContext } from "@/contexts/MascotEmotionContext";
import { gameImages } from "@/assets/games";
import { games, Game, globalGameText, allGames, gameCategories, GameCategory } from "@/data/games";
import GameCard from "./GameCard";
import PlaquePatrolGame from "./PlaquePatrolGame";
import ToothDefenderGame from "./ToothDefenderGame";
import FlossHeroGame from "./FlossHeroGame";
import SugarBugChaseGame from "./SugarBugChaseGame";
import BuildASmileGame from "./BuildASmileGame";
import QuestMatchGame from "./QuestMatchGame";
import ToothFairyRunGame from "./ToothFairyRunGame";
import HealthyFoodSortGame from "./HealthyFoodSortGame";
import PlaquePopPartyGame from "./PlaquePopPartyGame";
import MouthwashSplashGame from "./MouthwashSplashGame";
import GermBlasterGame from "./GermBlasterGame";
import ToothTriviaGame from "./ToothTriviaGame";
import DentalMemoryMatchGame from "./DentalMemoryMatchGame";
import BrushTimerChallengeGame from "./BrushTimerChallengeGame";
import MorningRoutineRaceGame from "./MorningRoutineRaceGame";
import NighttimeBrushQuestGame from "./NighttimeBrushQuestGame";
import DesignASmileGame from "./DesignASmileGame";
import ToothFairyTreasureGame from "./ToothFairyTreasureGame";
import PlaqueDetectiveGame from "./PlaqueDetectiveGame";
import FlossSequenceGame from "./FlossSequenceGame";
import SuperSmileMakerGame from "./SuperSmileMakerGame";
import ComingSoonGame from "./ComingSoonGame";
import SugarRushMazeGame from "./SugarRushMazeGame";
import BracesBuilderGame from "./BracesBuilderGame";
import ToothPuzzleAdventureGame from "./ToothPuzzleAdventureGame";
import BuildYourSmileProGame from "./BuildYourSmileProGame";
import CavityMazeGame from "./CavityMazeGame";
import EnamelMatchGame from "./EnamelMatchGame";
import SmileSelfieStudioGame from "./SmileSelfieStudioGame";
import CandyVsToothArtGame from "./CandyVsToothArtGame";
import ConfettiCelebration from "@/components/ConfettiCelebration";
import GameContainer from "./GameContainer";
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
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useEntitlementStatus } from "@/hooks/useEntitlementStatus";

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
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "all">("all");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [challengeNotification, setChallengeNotification] = useState<{
    show: boolean;
    title: string;
    xp: number;
  } | null>(null);
  
  // Mascot emotion context for reactive feedback
  const { triggerLetsPlay, triggerSuccess, triggerWow, triggerError } = useMascotEmotionContext();
  
  const { user, session } = useAuth();
  const { isPurchased, isContentLocked, isCheckingPurchase, lastPurchaseCheckAt } = usePurchase();
  const {
    isAdmin,
    isAdminLoading,
    adminError,
    adminCheckedAt,
  } = useAdminStatus();
  const {
    hasEntitlement,
    entitlementLoading,
    entitlementError,
    entitlementCheckedAt,
  } = useEntitlementStatus();
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
    startBackgroundMusic,
    stopBackgroundMusic,
    isMuted, 
    toggleMute 
  } = useGameSounds();

  const { incrementProgress } = useDailyChallenges(childId);

  // Games follow the same locking rules as the rest of the app (test mode included)
  // plus a server-validated override for admin accounts / manual entitlements.
  const baseGamesLocked = isContentLocked(0, 'game', completedQuestsCount);
  const areGamesLocked = baseGamesLocked && !(isAdmin || hasEntitlement);

  const gamesLockReason = (() => {
    if (!user) return "Not signed in.";
    if (!session?.access_token) return "Session missing/expired.";
    if (isCheckingPurchase || isAdminLoading || entitlementLoading) return "Checking your access…";
    if (adminError) return "Admin check failed.";
    if (entitlementError) return "Entitlement check failed.";
    if (!baseGamesLocked) return null;
    if (isAdmin || hasEntitlement || isPurchased) return null;
    return "Premium access required.";
  })();
  
  // Create lock status for ALL games
  const allGamesWithLockStatus = allGames.map((game) => ({
    ...game,
    isLocked: areGamesLocked,
  }));
  
  // Filter games by category
  const displayedGames = selectedCategory === "all" 
    ? allGamesWithLockStatus 
    : allGamesWithLockStatus.filter(g => g.category === selectedCategory);

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
      // Trigger success/wow mascot emotion for wins
      if (stars >= 3) {
        triggerWow();
      } else {
        triggerSuccess();
      }
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
      // Trigger oops mascot emotion for losses
      triggerError();
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
    // Trigger letsPlay mascot emotion when starting a game
    triggerLetsPlay();
    // Start background music immediately from the user's click (mobile-friendly)
    startBackgroundMusic("happy");
    setSelectedGame(game);
    fetchLeaderboard(game.id);
  };

  useEffect(() => {
    if (!isOpen) {
      stopBackgroundMusic();
    }
  }, [isOpen, stopBackgroundMusic]);

  const renderGame = () => {
    if (!selectedGame) return null;

    const gameProps = {
      game: selectedGame,
      onComplete: (won: boolean, stars: number) => handleGameComplete(won, stars, stars * 10),
    };

    let gameContent;
    switch (selectedGame.id) {
      case "plaque_patrol":
        gameContent = <PlaquePatrolGame {...gameProps} />; break;
      case "tooth_defender":
        gameContent = <ToothDefenderGame {...gameProps} />; break;
      case "floss_hero":
        gameContent = <FlossHeroGame {...gameProps} />; break;
      case "sugar_bug_chase":
        gameContent = <SugarBugChaseGame {...gameProps} />; break;
      case "build_a_smile":
        gameContent = <BuildASmileGame {...gameProps} />; break;
      case "quest_match":
        gameContent = <QuestMatchGame {...gameProps} />; break;
      case "tooth_fairy_run":
        gameContent = <ToothFairyRunGame {...gameProps} />; break;
      case "healthy_food_sort":
        gameContent = <HealthyFoodSortGame {...gameProps} />; break;
      case "plaque_pop_party":
        gameContent = <PlaquePopPartyGame {...gameProps} />; break;
      case "mouthwash_splash":
        gameContent = <MouthwashSplashGame {...gameProps} />; break;
      case "germ_blaster":
        gameContent = <GermBlasterGame {...gameProps} />; break;
      case "tooth_trivia":
        gameContent = <ToothTriviaGame {...gameProps} />; break;
      case "dental_memory_match":
        gameContent = <DentalMemoryMatchGame {...gameProps} />; break;
      case "brush_timer_challenge":
        gameContent = <BrushTimerChallengeGame {...gameProps} />; break;
      case "morning_routine_race":
        gameContent = <MorningRoutineRaceGame {...gameProps} />; break;
      case "nighttime_brush_quest":
        gameContent = <NighttimeBrushQuestGame {...gameProps} />; break;
      case "design_a_smile":
        gameContent = <DesignASmileGame {...gameProps} />; break;
      case "tooth_fairy_treasure":
        gameContent = <ToothFairyTreasureGame {...gameProps} />; break;
      case "plaque_detective":
        gameContent = <PlaqueDetectiveGame {...gameProps} />; break;
      case "floss_sequence":
        gameContent = <FlossSequenceGame {...gameProps} />; break;
      case "super_smile_maker":
        gameContent = <SuperSmileMakerGame {...gameProps} />; break;
      case "sugar_rush_maze":
        gameContent = <SugarRushMazeGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "braces_builder":
        gameContent = <BracesBuilderGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "tooth_puzzle_adventure":
        gameContent = <ToothPuzzleAdventureGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "build_your_smile_pro":
        gameContent = <BuildYourSmileProGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "cavity_maze":
        gameContent = <CavityMazeGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "enamel_match":
        gameContent = <EnamelMatchGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "smile_selfie_studio":
        gameContent = <SmileSelfieStudioGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      case "candy_vs_tooth_art":
        gameContent = <CandyVsToothArtGame onComplete={(score) => handleGameComplete(true, Math.ceil(score / 30), score)} onClose={handleBackToGames} />; break;
      default:
        gameContent = <ComingSoonGame game={selectedGame} onBack={handleBackToGames} />;
    }

    return (
      <GameContainer gameId={selectedGame.id}>
        {gameContent}
      </GameContainer>
    );
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
                <div className="flex items-center gap-3">
                  {/* Mascot emotion in header */}
                  <MascotEmotionState emotion="letsPlay" size="sm" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Fun Games
                    </h2>
                    {user && childId && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        ⭐ {getTotalStars()} stars
                      </span>
                    )}
                  </div>
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

              {/* Game Result Screen - Enhanced Victory Celebration */}
              {gameResult && selectedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 relative overflow-hidden"
                >
                  {/* Victory Background Effects */}
                  {gameResult.won && (
                    <>
                      {/* Floating sparkles */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            opacity: 0, 
                            x: Math.random() * 400 - 200,
                            y: Math.random() * 400 - 200,
                            scale: 0
                          }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360]
                          }}
                          transition={{ 
                            duration: 2,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="absolute text-2xl pointer-events-none"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                          }}
                        >
                          {["✨", "⭐", "🌟", "💫", "🎉", "🦷"][i % 6]}
                        </motion.div>
                      ))}
                      
                      {/* Pulsing glow ring */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 blur-3xl"
                      />
                    </>
                  )}

                  {/* Game image + Mascot for result */}
                  <div className="relative z-10 mb-4 flex flex-col items-center gap-3">
                    {gameImages[selectedGame.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 rounded-2xl overflow-hidden shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.3)] image-3d-card"
                      >
                        <img src={gameImages[selectedGame.id]} alt={selectedGame.name} className="w-full h-full object-cover" />
                      </motion.div>
                    )}
                    <MascotEmotionState 
                      emotion={gameResult.won ? (gameResult.stars >= 3 ? "wow" : "greatJob") : "oops"} 
                      size="lg" 
                    />
                  </div>
                  
                  {/* Victory message with typewriter effect */}
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-display text-3xl font-bold text-foreground mb-2 relative z-10"
                  >
                    {gameResult.won ? "🎉 YOU WON! 🎉" : selectedGame.loseMessage}
                  </motion.h3>

                  {gameResult.won && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg text-muted-foreground mb-4"
                    >
                      {selectedGame.winMessage}
                    </motion.p>
                  )}
                  
                  {gameResult.won && (
                    <>
                      {/* Stars with bounce animation */}
                      <div className="flex gap-2 mb-4 relative z-10">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50, rotate: -180 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{ 
                              delay: 0.6 + i * 0.2,
                              type: "spring",
                              stiffness: 200,
                              damping: 10
                            }}
                          >
                            <motion.div
                              animate={i < gameResult.stars ? {
                                scale: [1, 1.3, 1],
                                rotate: [0, 10, -10, 0]
                              } : {}}
                              transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
                            >
                              <Star
                                className={`w-12 h-12 ${
                                  i < gameResult.stars
                                    ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                                    : "text-muted"
                                }`}
                              />
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Stars earned text */}
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-muted-foreground mb-2"
                      >
                        {gameResult.stars} {gameResult.stars === 1 ? "Star" : "Stars"} Earned!
                      </motion.p>
                      
                      {/* Badge earned with special animation */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, type: "spring" }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full"
                      >
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="font-bold text-primary">{selectedGame.badgeName}</span>
                      </motion.div>
                    </>
                  )}
                  
                  {/* Action buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gameResult.won ? 1.6 : 0.5 }}
                    className="flex gap-4 mt-8 relative z-10"
                  >
                    <Button variant="outline" onClick={handleBackToGames}>
                      Back to Games
                    </Button>
                    <Button 
                      onClick={handlePlayAgain}
                      className={gameResult.won ? "bg-gradient-to-r from-primary to-secondary" : ""}
                    >
                      Play Again
                    </Button>
                  </motion.div>
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
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory("all")}
                        className="gap-1"
                      >
                        🎮 All ({allGamesWithLockStatus.length})
                      </Button>
                      {(Object.entries(gameCategories) as [GameCategory, typeof gameCategories.action][]).map(([key, category]) => (
                        <Button
                          key={key}
                          variant={selectedCategory === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(key)}
                          className="gap-1"
                        >
                          {category.emoji} {category.name.split(" / ")[0]} ({category.games.length})
                        </Button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {displayedGames.map((game, index) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onClick={() => handleGameSelect(game, game.isLocked || false)}
                          delay={index * 0.05}
                          lockReason={game.isLocked ? gamesLockReason ?? undefined : undefined}
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
                              {!!gamesLockReason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="font-semibold">Reason:</span> {gamesLockReason}
                                </p>
                              )}
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Status: auth {user ? "✓" : "✕"} · session {session?.access_token ? "✓" : "✕"} · admin {isAdmin ? "✓" : "✕"} · entitlement {hasEntitlement ? "✓" : "✕"} · purchased {isPurchased ? "✓" : "✕"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Checked: purchase {lastPurchaseCheckAt ? new Date(lastPurchaseCheckAt).toLocaleString() : "—"} · admin {adminCheckedAt ? new Date(adminCheckedAt).toLocaleString() : "—"} · entitlement {entitlementCheckedAt ? new Date(entitlementCheckedAt).toLocaleString() : "—"}
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
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6 max-h-32 overflow-y-auto">
                        {allGames.map((game) => (
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
