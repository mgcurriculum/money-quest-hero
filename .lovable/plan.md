

## Plan: Fix Welcome Screen Narration Not Playing

### Root Cause Analysis

Two likely issues preventing narration:

1. **`sessionStorage` quota guard**: If TTS previously hit a quota error, `tts_quota_exceeded` is set to `'1'` in `sessionStorage` and silently blocks all future `speak()` calls — even across page reloads (sessionStorage persists per tab). There's no way to clear it except closing the tab.

2. **Browser autoplay policy**: On mobile and in iframes (like the Lovable preview), browsers block `audio.play()` without a prior user gesture. The TTS fetch may succeed but `audio.play()` throws a `NotAllowedError` that gets caught silently (logged as "Narration error:" which only shows if you search for it).

### Fix

**File: `src/hooks/useNarration.ts`**

1. **Clear stale quota guard on page load** — only persist the quota block for 10 minutes instead of forever, so a temporary ElevenLabs quota issue doesn't permanently disable narration:
   ```typescript
   useEffect(() => {
     const stored = sessionStorage.getItem('tts_quota_exceeded');
     if (stored) {
       const ts = parseInt(stored, 10);
       // Clear if older than 10 minutes
       if (Date.now() - ts > 10 * 60 * 1000) {
         sessionStorage.removeItem('tts_quota_exceeded');
       } else {
         quotaExceededRef.current = true;
       }
     }
   }, []);
   ```
   And when setting it: `sessionStorage.setItem('tts_quota_exceeded', Date.now().toString())`

2. **Handle autoplay policy gracefully** — catch `NotAllowedError` from `audio.play()` and set a flag so the user knows they need to tap unmute/interact first. Don't swallow the error silently:
   ```typescript
   try {
     await audio.play();
   } catch (playErr: any) {
     if (playErr.name === 'NotAllowedError') {
       console.warn('Autoplay blocked by browser. User interaction required.');
     }
     setIsPlaying(false);
   }
   ```

3. **Add debug logging** — add `console.log` calls at the entry of `speak()` to trace why it might return early (muted, quota, env vars missing), making future debugging faster.

### Summary of Changes

Single file edit: `src/hooks/useNarration.ts`
- Time-limited quota guard (10 min TTL instead of permanent)
- Explicit autoplay error handling
- Debug logging for silent early returns

