import { ReactNode } from "react";
import { motion } from "framer-motion";
import { gameImages } from "@/assets/games";

interface GameContainerProps {
  gameId: string;
  children: ReactNode;
}

/**
 * Wraps game content with a semi-3D styled container including
 * the game's image as a faded background watermark for visual depth.
 */
const GameContainer = ({ gameId, children }: GameContainerProps) => {
  const gameImage = gameImages[gameId];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Semi-3D background watermark */}
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
            animate={{ opacity: 0.06, scale: 1 }}
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
