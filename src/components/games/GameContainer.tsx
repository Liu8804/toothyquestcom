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
      {/* Subtle semi-3D game image badge - bottom-right to avoid HUD overlap */}
      {gameImage && (
        <div className="absolute bottom-2 right-2 z-[3] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 }}
          >
            <GameImage
              src={gameImage}
              alt=""
              width={36}
              height={36}
              enable3D
              loading="eager"
              className="shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.2)]"
            />
          </motion.div>
        </div>
      )}
      {/* Background watermark */}
      {gameImage && (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <motion.img
            src={gameImage}
            alt=""
            width={180}
            height={180}
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.06, scale: 1 }}
            className="w-44 h-44 object-cover rounded-3xl blur-sm"
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
