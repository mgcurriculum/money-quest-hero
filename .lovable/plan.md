

## Plan: Fix Welcome Screen Narration Not Playing

### Problem
The TTS narration on the welcome screen is not firing. The `useEffect` sets `hasNarrated.current = true` immediately but the `speak` callback reference changes on subsequent renders (since it depends on `stop` and `isMuted`). Once `hasNarrated` is `true`, narration never retries. Additionally, no network requests to the TTS edge function are being made, confirming `speak()` is never successfully called.

### Root Cause
The `useEffect` in `WelcomeScreen.tsx` lists `speak` as a dependency. Because `speak` is a `useCallback` that depends on `stop` (which itself is a `useCallback`), its reference can change across renders. The effect runs, sets `hasNarrated = true`, schedules `speak`, but if the component re-renders before the timeout fires and `speak`'s reference changes, the cleanup clears the timer. On the next effect run, `hasNarrated` is already `true`, so it never tries again.

### Fix

**File: `src/components/game/WelcomeScreen.tsx`**
- Remove `speak` from the `useEffect` dependency array (use a ref for `speak` instead) so the effect only runs once on mount
- Use a `speakRef` pattern: store the latest `speak` in a ref and call `speakRef.current()` from the timeout, so the effect doesn't re-run when `speak` changes

### Voice ID
The current voice ID in the edge function (`Ih3XRGwQe2qczi6DzW48`) matches what's been configured. No change needed there — the voice ID is already set. If the user wants a different voice, they can clarify which one.

### Changes

**`src/components/game/WelcomeScreen.tsx`** — Fix the narration useEffect:
```typescript
const speakRef = useRef(speak);
speakRef.current = speak;

useEffect(() => {
  if (!state.isMuted && !hasNarrated.current) {
    hasNarrated.current = true;
    const timer = setTimeout(() => speakRef.current(WELCOME_TEXT), 600);
    return () => clearTimeout(timer);
  }
}, [state.isMuted]);
```

Single file change, no backend modifications.

