import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route-based Music Controller
 * 
 * Ensures home music ONLY plays on the "/" route and stops
 * immediately when navigating to any other page.
 * 
 * This hook should be used at the App level to coordinate
 * with the useHomeMusic hook in HeroSection.
 */

// Singleton to store stop callback
let stopMusicCallback: (() => void) | null = null;

export const registerMusicStopCallback = (callback: () => void) => {
  stopMusicCallback = callback;
};

export const unregisterMusicStopCallback = () => {
  stopMusicCallback = null;
};

export const stopHomeMusicGlobally = () => {
  if (stopMusicCallback) {
    stopMusicCallback();
  }
};

export const useRouteMusicController = () => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // If we're NOT on home page, stop the music
    if (currentPath !== "/") {
      stopHomeMusicGlobally();
    }

    previousPathRef.current = currentPath;
  }, [location.pathname]);

  return null;
};

export default useRouteMusicController;
