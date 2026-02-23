import { useState, memo } from "react";
import { cn } from "@/lib/utils";

interface GameImageProps {
  src: string;
  alt: string;
  /** CSS class for the wrapper div */
  className?: string;
  /** Explicit width for CLS prevention (default 112 = w-28) */
  width?: number;
  /** Explicit height for CLS prevention (default 112 = h-28) */
  height?: number;
  /** Loading strategy (default "lazy") */
  loading?: "lazy" | "eager";
  /** Whether to apply the 3D card effect */
  enable3D?: boolean;
}

/**
 * Optimized game image component that prevents CLS, 
 * uses lazy loading, and provides a smooth fade-in.
 */
const GameImage = memo(({
  src,
  alt,
  className,
  width = 112,
  height = 112,
  loading = "lazy",
  enable3D = false,
}: GameImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-muted/30",
        enable3D && "image-3d-card shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.3)]",
        className
      )}
      style={{ width, height }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
});

GameImage.displayName = "GameImage";

export default GameImage;
