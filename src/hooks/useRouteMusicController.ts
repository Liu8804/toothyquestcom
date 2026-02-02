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

// Direct reference to audio element for immediate stop when callback is unavailable
let homeMusicAudioRef: HTMLAudioElement | null = null;

export const registerMusicStopCallback = (callback: () => void) => {
  stopMusicCallback = callback;
};

export const unregisterMusicStopCallback = () => {
  stopMusicCallback = null;
};

export const registerHomeMusicAudio = (audio: HTMLAudioElement | null) => {
  // Only update if setting a new audio element, not when unregistering
  // This allows the route controller to stop music even after component unmounts
  if (audio !== null) {
    homeMusicAudioRef = audio;
  }
};

export const stopHomeMusicGlobally = () => {
  // Always stop immediately via the audio element to avoid any fade-out overlap
  // with voice/quiz narration.
  if (homeMusicAudioRef) {
    // Ensure any hook-level fade-out logic short-circuits.
    homeMusicAudioRef.volume = 0;
    homeMusicAudioRef.pause();
    homeMusicAudioRef.currentTime = 0;
  }

  // Also call the hook-level stop callback so it can clean up intervals/state.
  // (This may fade out, but audio is already paused above.)
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
