export interface Song {
  id: string;
  title: string;
  emoji: string;
  useCase: string;
  mood: string;
  duration: string;
  lyrics: string;
  devNote: string;
  color: string;
}

export const songs: Song[] = [
  {
    id: "welcome",
    title: "Welcome Song",
    emoji: "🎉",
    useCase: "Home / App Open",
    mood: "Happy, magical, inviting",
    duration: "~15 seconds",
    lyrics: `Welcome to ToothyQuest!
A world of smiles and fun.
We learn, we play, we help our teeth,
And every quest's begun!

ToothyQuest! ToothyQuest!
Let's begin — come on, let's go!`,
    devNote: "Loopable. Mascot waves, sparkles, soft bounce animation.",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "daily-care",
    title: "Daily Care Song",
    emoji: "🪥",
    useCase: "Daily routine / brushing / habits quest",
    mood: "Energetic, rhythmic",
    duration: "~20 seconds",
    lyrics: `Brush, brush, clean and bright,
Morning time and every night!
Up and down and all around,
Happy teeth make happy sounds!

Happy teeth make happy sounds!
Happy teeth make happy sounds!`,
    devNote: "Sync brushing animation to rhythm. Works well with progress bar.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "flossing",
    title: "Floss Song",
    emoji: "🦷",
    useCase: "Skill quest (flossing / cleaning between teeth)",
    mood: "Calm + confident",
    duration: "~15 seconds",
    lyrics: `Trace the floss gently between each tooth,
Slide it slowly, that's the truth!
Clean and fresh, you did it right,
Flossing keeps your smile bright!`,
    devNote: "Mascot demonstrates floss motion. Good for instructional quests.",
    color: "from-teal-500 to-green-500",
  },
  {
    id: "healthy-habits",
    title: "Healthy Habits Song",
    emoji: "🥗",
    useCase: "Food choices / learning quest",
    mood: "Cheerful, educational",
    duration: "~20 seconds",
    lyrics: `Water, fruits, and veggies too,
Help our teeth stay strong for you!
Sweet treats sometimes, not all day,
Healthy choices lead the way!`,
    devNote: "Show food icons popping in/out. Great for mini-games.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "quest-complete",
    title: "Quest Complete Song",
    emoji: "🏆",
    useCase: "Reward / badge / celebration screen",
    mood: "Celebration",
    duration: "~10–12 seconds",
    lyrics: `Quest complete — hooray!
You helped your smile today!
Stars and badges just for you,
Great job — let's quest again soon!`,
    devNote: "Confetti + badge animation. Perfect for reward feedback.",
    color: "from-yellow-500 to-amber-500",
  },
];
