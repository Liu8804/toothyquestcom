import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ThemedSectionWrapperProps {
  children: ReactNode;
  theme: "forest" | "ocean" | "crystal" | "meadow" | "sunset";
  className?: string;
  id?: string;
}

const themeStyles = {
  forest: {
    bg: "from-emerald-50/40 via-green-50/20 to-teal-50/30",
    darkBg: "dark:from-emerald-950/20 dark:via-green-950/10 dark:to-teal-950/15",
    accent: "hsl(var(--primary) / 0.06)",
    decos: ["🌳", "🍄", "🌿", "🦋"],
  },
  ocean: {
    bg: "from-cyan-50/40 via-sky-50/20 to-blue-50/30",
    darkBg: "dark:from-cyan-950/20 dark:via-sky-950/10 dark:to-blue-950/15",
    accent: "hsl(var(--secondary) / 0.06)",
    decos: ["🐟", "🫧", "🐚", "🌊"],
  },
  crystal: {
    bg: "from-purple-50/40 via-violet-50/20 to-indigo-50/30",
    darkBg: "dark:from-purple-950/20 dark:via-violet-950/10 dark:to-indigo-950/15",
    accent: "hsl(var(--accent) / 0.06)",
    decos: ["💎", "✨", "🔮", "⭐"],
  },
  meadow: {
    bg: "from-lime-50/40 via-yellow-50/20 to-amber-50/30",
    darkBg: "dark:from-lime-950/20 dark:via-yellow-950/10 dark:to-amber-950/15",
    accent: "hsl(var(--star) / 0.06)",
    decos: ["🌻", "🌼", "🐝", "🦄"],
  },
  sunset: {
    bg: "from-orange-50/40 via-rose-50/20 to-pink-50/30",
    darkBg: "dark:from-orange-950/20 dark:via-rose-950/10 dark:to-pink-950/15",
    accent: "hsl(var(--candy) / 0.06)",
    decos: ["🌅", "🎆", "🌈", "🦩"],
  },
};

const ThemedSectionWrapper = ({
  children,
  theme,
  className = "",
  id,
}: ThemedSectionWrapperProps) => {
  const style = themeStyles[theme];

  return (
    <section
      id={id}
      className={`relative overflow-hidden bg-gradient-to-b ${style.bg} ${style.darkBg} ${className}`}
    >
      {/* Subtle radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 120% 60% at 50% 0%, ${style.accent}, transparent)`,
        }}
      />

      {/* Floating themed decorations */}
      {style.decos.map((deco, i) => (
        <motion.span
          key={i}
          className="absolute text-lg md:text-xl opacity-15 pointer-events-none select-none z-0"
          style={{
            left: `${8 + i * 25}%`,
            top: `${12 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -10 - i * 3, 0],
            rotate: [0, 5, -5, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        >
          {deco}
        </motion.span>
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default ThemedSectionWrapper;
