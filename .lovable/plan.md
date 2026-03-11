

### Task: Neutral Feedback Messages & Remove Score Popups

**Changes in `src/components/game/QuestionPlay.tsx`:**

1. **Replace feedback messages** with neutral, non-judgmental ones:
   - "Noted! 📝" → "Got it! ✅"
   - "Interesting! 🧐" → "Recorded! 📝"
   - "Bold move! 💪" → "Moving on! ➡️"
   - "Smart thinking! 🧠" → "Saved! 💾"
   - "Power play! 🌟" → "Next up! 🔄"

2. **Remove the score popup overlay** (lines 153-170) — the entire `AnimatePresence` block that shows the feedback card with icon + text in the center of the screen will be removed.

3. **Keep the brief selection highlight** on the chosen option (the gold border animation) as visual confirmation, then auto-advance after a shorter delay (~800ms instead of 1200ms).

4. **Remove spoken feedback** — remove the `speak(feedbackText)` call on answer selection since neutral messages don't need narration.

