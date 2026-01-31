import { useEffect, useRef, useCallback, useState } from "react";
import { getEffectiveVolume, getVolumeSettings } from "@/components/VolumeControlPanel";
import { isVoiceActive, getAudioContext, unlockAudioContext } from "./useAudioManager";

/**
 * Home Screen Background Music
 * 
 * Plays calm, child-friendly ambient music loop on the home screen.
 * Uses xylophone/bell-like tones for a gentle, playful feel.
 * 
 * - Low volume by default (respects user settings)
 * - Ducks when voice is playing
 * - Only plays after first user interaction (browser requirement)
 * - Respects system mute
 */

// Xylophone/bell-like notes in C major pentatonic (child-friendly, calming)
const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

interface UseHomeMusicReturn {
  isPlaying: boolean;
  isMuted: boolean;
  start: () => void;
  stop: () => void;
  toggleMute: () => void;
}

const STORAGE_KEY = "toothyquest-home-music-muted";

// Simple melody pattern for ambient loop (indices into noteValues array)
const MELODY_PATTERN = [0, 2, 4, 5, 4, 2, 3, 1, 0, 4, 5, 7, 5, 4, 2, 0];
const NOTE_VALUES = Object.values(NOTES);

export const useHomeMusic = (): UseHomeMusicReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const melodyIndexRef = useRef(0);
  const isInitializedRef = useRef(false);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Play a single xylophone-like note
  const playNote = useCallback((frequency: number) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") return;
      
      // Create oscillators for xylophone-like timbre
      // Xylophone = fundamental + harmonics with quick decay
      const fundamental = ctx.createOscillator();
      const harmonic2 = ctx.createOscillator();
      const harmonic3 = ctx.createOscillator();
      
      const fundamentalGain = ctx.createGain();
      const harmonic2Gain = ctx.createGain();
      const harmonic3Gain = ctx.createGain();
      const masterGain = ctx.createGain();
      
      // Use sine waves for pure, bell-like tones
      fundamental.type = "sine";
      harmonic2.type = "sine";
      harmonic3.type = "sine";
      
      fundamental.frequency.setValueAtTime(frequency, ctx.currentTime);
      harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime); // Octave
      harmonic3.frequency.setValueAtTime(frequency * 4, ctx.currentTime); // 2 octaves
      
      // Get user volume setting, apply ducking if voice is active
      const baseVolume = getEffectiveVolume("music");
      const voiceActive = isVoiceActive();
      const masterVol = voiceActive ? baseVolume * 0.1 : baseVolume * 0.15;
      
      // Relative volumes for harmonics (fundamental loudest)
      const t = ctx.currentTime;
      fundamentalGain.gain.setValueAtTime(masterVol * 0.6, t);
      harmonic2Gain.gain.setValueAtTime(masterVol * 0.25, t);
      harmonic3Gain.gain.setValueAtTime(masterVol * 0.1, t);
      
      // Quick attack, medium decay (xylophone characteristic)
      masterGain.gain.setValueAtTime(0.001, t);
      masterGain.gain.linearRampToValueAtTime(1, t + 0.01);
      masterGain.gain.exponentialRampToValueAtTime(0.3, t + 0.3);
      masterGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      
      // Connect oscillators through gains
      fundamental.connect(fundamentalGain);
      harmonic2.connect(harmonic2Gain);
      harmonic3.connect(harmonic3Gain);
      
      fundamentalGain.connect(masterGain);
      harmonic2Gain.connect(masterGain);
      harmonic3Gain.connect(masterGain);
      
      masterGain.connect(ctx.destination);
      
      // Start and stop oscillators
      fundamental.start(t);
      harmonic2.start(t);
      harmonic3.start(t);
      
      fundamental.stop(t + 1.6);
      harmonic2.stop(t + 1.6);
      harmonic3.stop(t + 1.6);
      
    } catch (err) {
      // Silently fail - audio not critical
    }
  }, []);

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
      
      isInitializedRef.current = true;
      setIsPlaying(true);
      melodyIndexRef.current = 0;
      
      // Play notes at intervals to create ambient melody
      // Slow tempo (every 2 seconds) for calm effect
      const playNextNote = () => {
        if (isMuted) return;
        
        const noteIndex = MELODY_PATTERN[melodyIndexRef.current % MELODY_PATTERN.length];
        const frequency = NOTE_VALUES[noteIndex];
        
        playNote(frequency);
        
        melodyIndexRef.current++;
      };
      
      // Play first note immediately
      playNextNote();
      
      // Continue playing at intervals
      intervalRef.current = setInterval(playNextNote, 2500); // Every 2.5 seconds
      
    } catch (err) {
      console.error("Failed to start home music:", err);
    }
  }, [isMuted, playNote]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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
    melodyIndexRef.current = 0;
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
    };
  }, [stop]);

  // Listen for volume settings changes
  useEffect(() => {
    const handleVolumeChange = () => {
      const settings = getVolumeSettings();
      if (settings.musicVolume === 0 || settings.masterVolume === 0) {
        stop();
      }
    };

    window.addEventListener("volume-settings-changed", handleVolumeChange);
    return () => window.removeEventListener("volume-settings-changed", handleVolumeChange);
  }, [stop]);

  return {
    isPlaying,
    isMuted,
    start,
    stop,
    toggleMute,
  };
};

export default useHomeMusic;
