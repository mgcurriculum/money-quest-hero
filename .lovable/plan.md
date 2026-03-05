

## Plan: Add Voice Narration to All Screens

Extend the existing `useNarration` hook to all remaining screens. Each screen gets auto-play narration with a mute toggle, and voice feedback on answer selections where applicable.

### Screens to Update

**1. ConsentScreen.tsx** — "Before We Begin"
- Add `useNarration` hook, mute toggle button (top-right)
- Auto-play: "Before we begin. We respect your privacy. Your responses will only be used to generate your Financial Intelligence Report. Please check both boxes to continue."
- Stop narration on "Continue" or "Back"

**2. ProfileScreen.tsx** — "Create Your Money Profile"
- Add `useNarration` hook, mute toggle button (top-right)
- Step 0 auto-play: "Create your money profile. Enter your name, age and gender to get started."
- Step 1 auto-play: "What best describes your current stage? And how do you usually receive money?"
- Stop narration on navigation

**3. JourneyMap.tsx** — Journey Map
- Add `useNarration` hook, mute toggle button (top-right)
- Auto-play on mount: "Here's your journey map. Tap a level to begin your quest."
- When all levels complete, narrate: "Amazing! You've completed all levels. Tap View Your Results to see your report."
- Stop narration on level select or results button

**4. LevelPlay.tsx** — Main 5 Levels (Questions)
- Add `useNarration` hook, mute toggle button in header
- Auto-play each scenario's `situation` text when question changes
- Speak feedback text after answer selection (same pattern as RealityCheckPlay)
- Stop narration on answer select, then speak feedback

**5. ReflectionScreen.tsx** — Final Reflection
- Add `useNarration` hook, mute toggle button (top-right)
- Step 0 auto-play: "How interested are you in improving your financial knowledge?"
- Step 1 auto-play: "Final reflection. If you could improve one money skill this year, what would it be?"
- Stop narration on selection

### Files to Change
- `src/components/game/ConsentScreen.tsx`
- `src/components/game/ProfileScreen.tsx`
- `src/components/game/JourneyMap.tsx`
- `src/components/game/LevelPlay.tsx`
- `src/components/game/ReflectionScreen.tsx`

All follow the same pattern already established in `WelcomeScreen.tsx` and `RealityCheckPlay.tsx`: import `useNarration`, add mute toggle UI, `useEffect` for auto-play, `stop()` before navigation.

