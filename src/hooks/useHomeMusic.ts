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

  // Fade in effect
  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number, duration = 1500) => {
    audio.volume = 0;
    const steps = 30;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
    
    return fadeInterval;
  }, []);

  // Fade out effect
  const fadeOut = useCallback((audio: HTMLAudioElement, duration = 800): Promise<void> => {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;
      
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.currentTime = 0;
          resolve();
        }
      }, stepTime);
    });
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
      
      // Start with volume at 0 for fade-in
      audioRef.current.volume = 0;
      
      // Play audio with fade-in
      audioRef.current.play()
        .then(() => {
          isInitializedRef.current = true;
          setIsPlaying(true);
          
          // Fade in to target volume
          const baseVolume = getEffectiveVolume("music");
          fadeIn(audioRef.current!, baseVolume * 0.3);
          
          // Start volume monitoring for ducking
          volumeUpdateIntervalRef.current = setInterval(updateVolume, 100);
        })
        .catch((err) => {
          console.log("Audio autoplay blocked, waiting for interaction:", err.message);
        });
      
    } catch (err) {
      console.error("Failed to start home music:", err);
    }
  }, [isMuted, updateVolume, fadeIn]);

  const stop = useCallback(async () => {
    if (audioRef.current && audioRef.current.volume > 0) {
      // Fade out before stopping
      await fadeOut(audioRef.current);
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (volumeUpdateIntervalRef.current) {
      clearInterval(volumeUpdateIntervalRef.current);
      volumeUpdateIntervalRef.current = null;
    }
    
    isInitializedRef.current = false;
    setIsPlaying(false);
  }, [fadeOut]);

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
