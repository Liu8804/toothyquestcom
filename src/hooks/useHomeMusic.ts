import { useEffect, useRef, useCallback, useState } from "react";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";
import { isVoiceActive, unlockAudioContext } from "./useAudioManager";

/**
 * Home Screen Background Music
 * 
 * Plays calm, child-friendly ambient music loop on the home screen.
 * Uses the uploaded gentle chime audio file for a soothing feel.
 * 
 * - Low volume by default (respects user settings)
 * - Ducks when voice is playing
 * - Only plays after first user interaction (browser requirement)
 * - Respects system mute
 */

interface UseHomeMusicReturn {
  isPlaying: boolean;
  isMuted: boolean;
  start: () => void;
  stop: () => void;
  toggleMute: () => void;
}

const STORAGE_KEY = "toothyquest-home-music-muted";
const AUDIO_PATH = "/audio/home-background.wav";

export const useHomeMusic = (): UseHomeMusicReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);
  const volumeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update volume based on settings and voice activity
  const updateVolume = useCallback(() => {
    if (!audioRef.current) return;
    
    const baseVolume = getEffectiveVolume("music");
    const voiceActive = isVoiceActive();
    
    // Duck when voice is active, otherwise use low ambient volume
    const targetVolume = voiceActive ? baseVolume * 0.1 : baseVolume * 0.3;
    
    // Smooth volume transition
    const currentVol = audioRef.current.volume;
    const diff = targetVolume - currentVol;
    audioRef.current.volume = currentVol + diff * 0.1;
  }, []);

  const start = useCallback(() => {
    if (isInitializedRef.current || isMuted) return;
    
    const volumeSettings = getVolumeSettings();
    if (volumeSettings.musicVolume === 0 || volumeSettings.masterVolume === 0) return;
    
    try {
      unlockAudioContext();
      
      // Create audio element if not exists
      if (!audioRef.current) {
        audioRef.current = new Audio(AUDIO_PATH);
        audioRef.current.loop = true;
        audioRef.current.preload = "auto";
      }
      
      // Set initial low volume
      const baseVolume = getEffectiveVolume("music");
      audioRef.current.volume = baseVolume * 0.3;
      
      // Play audio
      audioRef.current.play()
        .then(() => {
          isInitializedRef.current = true;
          setIsPlaying(true);
          
          // Start volume monitoring for ducking
          volumeUpdateIntervalRef.current = setInterval(updateVolume, 100);
        })
        .catch((err) => {
          console.log("Audio autoplay blocked, waiting for interaction:", err.message);
        });
      
    } catch (err) {
      console.error("Failed to start home music:", err);
    }
  }, [isMuted, updateVolume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (volumeUpdateIntervalRef.current) {
      clearInterval(volumeUpdateIntervalRef.current);
      volumeUpdateIntervalRef.current = null;
    }
    
    isInitializedRef.current = false;
    setIsPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem(STORAGE_KEY, String(newMuted));
    
    if (newMuted) {
      stop();
    } else if (!isPlaying) {
      start();
    }
  }, [isMuted, stop, start, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [stop]);

  // Listen for volume settings changes
  useEffect(() => {
    const handleVolumeChange = () => {
      const settings = getVolumeSettings();
      if (settings.musicVolume === 0 || settings.masterVolume === 0) {
        stop();
      } else if (audioRef.current) {
        updateVolume();
      }
    };

    window.addEventListener("volume-settings-changed", handleVolumeChange);
    return () => window.removeEventListener("volume-settings-changed", handleVolumeChange);
  }, [stop, updateVolume]);

  return {
    isPlaying,
    isMuted,
    start,
    stop,
    toggleMute,
  };
};

export default useHomeMusic;
