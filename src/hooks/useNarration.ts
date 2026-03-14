import { useState, useRef, useCallback, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useNarration(externalMuted?: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const quotaExceededRef = useRef(false);

  // Use external muted state if provided
  const isMuted = externalMuted ?? false;

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  // Stop playback when muted externally
  useEffect(() => {
    if (isMuted) {
      stop();
    }
  }, [isMuted, stop]);

  useEffect(() => {
    quotaExceededRef.current = sessionStorage.getItem('tts_quota_exceeded') === '1';
  }, []);

  const speak = useCallback(async (text: string) => {
    if (isMuted) return;
    stop();

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      console.warn('Supabase not configured for TTS');
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        // Silently skip narration on API errors (e.g. quota exceeded)
        setIsLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      setIsLoading(false);
      setIsPlaying(true);
      await audio.play();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Narration error:', err);
      }
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [stop, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { isMuted, isPlaying, isLoading, speak, stop };
}
