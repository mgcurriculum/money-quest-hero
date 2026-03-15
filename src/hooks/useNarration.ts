import { useState, useRef, useCallback, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useNarration(externalMuted?: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const quotaExceededRef = useRef(false);

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

  useEffect(() => {
    if (isMuted) {
      stop();
    }
  }, [isMuted, stop]);

  // Time-limited quota guard (10 min TTL)
  useEffect(() => {
    const stored = sessionStorage.getItem('tts_quota_exceeded');
    if (stored) {
      const ts = parseInt(stored, 10);
      if (isNaN(ts) || Date.now() - ts > 10 * 60 * 1000) {
        sessionStorage.removeItem('tts_quota_exceeded');
        quotaExceededRef.current = false;
        console.log('[TTS] Cleared expired quota guard');
      } else {
        quotaExceededRef.current = true;
        console.log('[TTS] Quota guard active, expires in', Math.round((10 * 60 * 1000 - (Date.now() - ts)) / 1000), 's');
      }
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    console.log('[TTS] speak() called, muted:', isMuted, 'quota:', quotaExceededRef.current);
    if (isMuted) { console.log('[TTS] Skipped: muted'); return; }
    if (quotaExceededRef.current) { console.log('[TTS] Skipped: quota exceeded'); return; }
    stop();

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      console.warn('[TTS] Supabase not configured');
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
        const errorText = await response.text();
        console.warn('[TTS] API error:', response.status, errorText);
        if (errorText.includes('quota_exceeded')) {
          quotaExceededRef.current = true;
          sessionStorage.setItem('tts_quota_exceeded', Date.now().toString());
          console.warn('[TTS] Quota exceeded — narration disabled for 10 min');
        }
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

      try {
        await audio.play();
        setAutoplayBlocked(false);
      } catch (playErr: any) {
        if (playErr.name === 'NotAllowedError') {
          console.warn('[TTS] Autoplay blocked by browser. User interaction required.');
          setAutoplayBlocked(true);
        } else {
          console.error('[TTS] Play error:', playErr);
        }
        setIsPlaying(false);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[TTS] Narration error:', err);
      }
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [stop, isMuted]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { isMuted, isPlaying, isLoading, speak, stop };
}
