import { useEffect, useRef, useCallback, useState } from "react";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";
import { isVoiceActive, getAudioContext, unlockAudioContext } from "./useAudioManager";

/**
 * Home Screen Background Music
 * 
 * Plays calm, child-friendly ambient music loop on the home screen.
 * - Low volume by default (respects user settings)
 * - Ducks when voice is playing
 * - Only plays after first user interaction (browser requirement)
 * - Respects system mute
 */

// Pre-generated gentle ambient loop using Web Audio API
// This creates a soft, calming drone that's pleasant for kids
const NOTES = {
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  C5: 523.25,
};

interface UseHomeMusicReturn {
  isPlaying: boolean;
  isMuted: boolean;
  start: () => void;
  stop: () => void;
  toggleMute: () => void;
}

const STORAGE_KEY = "toothyquest-home-music-muted";

export const useHomeMusic = (): UseHomeMusicReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  // Update volume based on voice state and settings
  const updateVolume = useCallback(() => {
    if (!masterGainRef.current || isMuted) return;
    
    const baseVolume = getEffectiveVolume("music");
    const voiceActive = isVoiceActive();
    // Duck to 15% when voice is playing, otherwise use 30% of music volume for subtle background
    const targetVolume = voiceActive ? baseVolume * 0.15 : baseVolume * 0.3;
    
    masterGainRef.current.gain.setTargetAtTime(
      targetVolume,
      masterGainRef.current.context.currentTime,
      0.3 // Smooth transition
    );
    
    // Continue updating
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, [isMuted]);

  const start = useCallback(() => {
    if (isInitializedRef.current || isMuted) return;
    
    const volumeSettings = getVolumeSettings();
    if (volumeSettings.musicVolume === 0 || volumeSettings.masterVolume === 0) return;
    
    try {
      unlockAudioContext();
      const ctx = getAudioContext();
      
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      
      // Create master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
      
      // Create a gentle pad with multiple layered oscillators
      const notes = [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5];
      const oscillators: OscillatorNode[] = [];
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.value = freq;
        
        // Very subtle volume for each note
        oscGain.gain.value = 0.08 - (i * 0.015);
        
        // Add slight detuning for warmth
        osc.detune.value = (Math.random() - 0.5) * 5;
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        oscillators.push(osc);
      });
      
      oscillatorsRef.current = oscillators;
      isInitializedRef.current = true;
      
      // Fade in slowly
      const targetVolume = getEffectiveVolume("music") * 0.3;
      masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 2);
      
      setIsPlaying(true);
      
      // Start volume monitoring
      animationFrameRef.current = requestAnimationFrame(updateVolume);
      
    } catch (err) {
      console.error("Failed to start home music:", err);
    }
  }, [isMuted, updateVolume]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    oscillatorsRef.current = [];
    
    if (masterGainRef.current) {
      try {
        masterGainRef.current.disconnect();
      } catch {
        // ignore
      }
      masterGainRef.current = null;
    }
    
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch {
        // ignore
      }
      gainNodeRef.current = null;
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
    }
  }, [isMuted, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Listen for volume settings changes
  useEffect(() => {
    const handleVolumeChange = () => {
      if (!masterGainRef.current) return;
      const volume = getEffectiveVolume("music") * 0.3;
      masterGainRef.current.gain.setTargetAtTime(
        volume,
        masterGainRef.current.context.currentTime,
        0.3
      );
    };

    window.addEventListener("volume-settings-changed", handleVolumeChange);
    return () => window.removeEventListener("volume-settings-changed", handleVolumeChange);
  }, []);

  return {
    isPlaying,
    isMuted,
    start,
    stop,
    toggleMute,
  };
};

export default useHomeMusic;
