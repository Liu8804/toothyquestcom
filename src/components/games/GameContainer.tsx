import { ReactNode } from "react";
import { motion } from "framer-motion";
import { gameImages } from "@/assets/games";
import GameImage from "./GameImage";

interface GameContainerProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Wraps game content with a semi-3D styled container including
 * the game's image as a visible header banner and subtle background watermark.
 */
const GameContainer = ({ gameId, children }: GameContainerProps) => {
  const gameImage = gameImages[gameId];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Prominent semi-3D game image in top-right corner */}
      {gameImage && (
        <div className="absolute top-3 right-3 z-[3] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
          >
            <GameImage
              src={gameImage}
              alt=""
              width={64}
              height={64}
              enable3D
              loading="eager"
              className="shadow-[0_6px_20px_-4px_hsl(var(--primary)/0.35)]"
            />
          </motion.div>
        </div>
      )}
      {/* Background watermark - slightly more visible */}
      {gameImage && (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <motion.img
            src={gameImage}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.08, scale: 1 }}
            className="w-64 h-64 object-cover rounded-3xl blur-sm"
          />
        </div>
      )}
      {/* Specular highlight overlay for 3D feel */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-b from-white/5 via-transparent to-black/5 rounded-xl" />
      {/* Game content */}
      <div className="relative z-[2] h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default GameContainer;
