export interface Game {
  id: string;
  name: string;
  shortDescription: string;
  instructionsKids: string;
  instructionsParents: string;
  winMessage: string;
  loseMessage: string;
  reward: string;
  badgeName: string;
  emoji: string;
  color: string;
  isLocked?: boolean;
}

export const games: Game[] = [
  {
    id: "plaque_patrol",
    name: "Plaque Patrol",
    shortDescription: "Tap the plaque bugs and clean the teeth!",
    instructionsKids: "Tap all the plaque bugs before time runs out.",
    instructionsParents: "This game helps children learn the importance of keeping teeth clean by removing plaque in a fun and engaging way.",
    winMessage: "Great job! All the teeth are clean!",
    loseMessage: "Let's try again and clean them faster!",
    reward: "⭐ Stars + Plaque Patrol Badge",
    badgeName: "Plaque Patrol Badge",
    emoji: "🦷",
    color: "from-teal-400 to-cyan-500",
  },
  {
    id: "tooth_defender",
    name: "Tooth Defender",
    shortDescription: "Protect your teeth with healthy choices!",
    instructionsKids: "Drag good items to the teeth. Swipe bad items away.",
    instructionsParents: "This game teaches children to recognize healthy and unhealthy habits for strong teeth.",
    winMessage: "Awesome choices! Your teeth are safe!",
    loseMessage: "Oops! Try again and pick the healthy items.",
    reward: "⭐ Stars + Tooth Defender Badge",
    badgeName: "Tooth Defender Badge",
    emoji: "🛡️",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "floss_hero",
    name: "Floss Hero",
    shortDescription: "Trace the floss and clean between teeth!",
    instructionsKids: "Trace the floss line slowly between each tooth.",
    instructionsParents: "This game improves fine motor skills and teaches proper flossing technique.",
    winMessage: "You did it! Super flossing!",
    loseMessage: "Slow and gentle wins the quest!",
    reward: "⭐ Stars + Floss Hero Badge",
    badgeName: "Floss Hero Badge",
    emoji: "🧵",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "sugar_bug_chase",
    name: "Sugar Bug Chase",
    shortDescription: "Stop sugar bugs from reaching the teeth!",
    instructionsKids: "Tap the sugar bugs before they reach the teeth.",
    instructionsParents: "This game helps children understand how sugar affects dental health.",
    winMessage: "Yay! You stopped the sugar bugs!",
    loseMessage: "The bugs escaped — try again!",
    reward: "⭐ Stars + Sugar Bug Champion Badge",
    badgeName: "Sugar Bug Champion Badge",
    emoji: "🐛",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "build_a_smile",
    name: "Build-A-Smile",
    shortDescription: "Build the healthiest smile!",
    instructionsKids: "Choose the best teeth, gums, and healthy items.",
    instructionsParents: "This creative game reinforces positive dental choices through play.",
    winMessage: "What a beautiful smile!",
    loseMessage: "Let's rebuild and try again!",
    reward: "⭐ Stars + Smile Builder Badge",
    badgeName: "Smile Builder Badge",
    emoji: "😁",
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: "quest_match",
    name: "Quest Match",
    shortDescription: "Match the dental items!",
    instructionsKids: "Flip the cards and find matching pairs.",
    instructionsParents: "This memory game strengthens recall while teaching dental vocabulary.",
    winMessage: "All matched! Amazing memory!",
    loseMessage: "Try again — you're getting better!",
    reward: "⭐ Stars + Memory Master Badge",
    badgeName: "Memory Master Badge",
    emoji: "🃏",
    color: "from-green-400 to-emerald-500",
  },
];

export const globalGameText = {
  starsEarned: "You earned stars for helping your smile!",
  lockedGame: "Complete more quests or unlock full access to play!",
  unlockButton: "Unlock All Games",
};
