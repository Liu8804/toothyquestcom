import { useState } from "react";

interface AnimatedVideoBackgroundProps {
  videoSrc: string;
  fallbackImage?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
}

/**
 * Reusable looping video background component for hero sections.
 * Falls back to a static gradient if video fails to load.
 */
const AnimatedVideoBackground = ({
  videoSrc,
  fallbackImage,
  className = "",
  overlayClassName = "bg-gradient-to-t from-background/90 via-background/50 to-transparent",
  children,
}: AnimatedVideoBackgroundProps) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : fallbackImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fallbackImage})` }}
        />
      ) : null}
      {/* Gradient overlay for text readability */}
      <div className={`absolute inset-0 ${overlayClassName}`} />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedVideoBackground;
