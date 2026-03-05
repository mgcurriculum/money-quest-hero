

## Plan: Add Welcome Voice + Voice Feedback on Answers

Two additions to the voice narration system:

### 1. Welcome Screen Auto-Narration
- Import and use `useNarration` hook in `WelcomeScreen.tsx`
- Auto-play a welcome message on mount: *"Welcome to the FQ Test by FinQuo Versity. Discover how smart you are with money through real-life scenarios. It takes only 5 minutes. Tap Start to begin!"*
- Add a mute/unmute toggle button (top-right corner) matching the existing style
- Stop narration when user taps "Start My FQ Test"

### 2. Voice Feedback After Answering (RealityCheckPlay)
- After the user selects an answer, narrate the feedback text (e.g., "Noted!", "Interesting!", "Great choice!")
- In `handleSelect`, call `speak(feedbackText)` instead of just `stop()`
- Extend the feedback timeout from 800ms to ~1200ms to let the short voice clip play
- Only speak feedback if not muted

### Files to Change
- **`src/components/game/WelcomeScreen.tsx`** -- Add useNarration hook, auto-play welcome message, mute toggle button
- **`src/components/game/RealityCheckPlay.tsx`** -- Speak feedback text after answer selection

