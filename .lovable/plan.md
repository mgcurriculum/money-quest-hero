

# Plan: Dynamic & Interactive Voice Narration

## Problem
Every question plays the same static narration line ("Read the question and choose your answer" / "picture this scenario"), making the voice feel repetitive and robotic.

## Solution
Make narration contextual and varied by generating dynamic prompts based on the question's dimension, category, question number, and progress. Add varied feedback responses tied to the score level (not just rotating through 5 fixed lines).

## Changes

### 1. Create narration prompt generator — `src/utils/narrationPrompts.ts` (new)

A utility with two functions:

**`getQuestionNarration(dimension, category, questionNumber, totalQuestions)`** — returns a randomly selected prompt from dimension-specific pools. Examples:
- Financial Reality: "Let's see where you stand with money right now.", "Time for a reality check on your finances.", "How well do you know your money situation?"
- Spending: "This one's about your spending habits.", "Let's talk about where your money goes.", "How do you handle the urge to spend?"
- Saving: "Saving money — easier said than done, right?", "Let's see how you handle putting money aside."
- Investment: "Now we're getting into investment territory.", "This is about growing your money."
- Plus milestone prompts at Q5, Q10, Q15: "You're on a roll! Question 10 already.", "Halfway there, keep going!"

Each dimension gets 6-8 unique prompts, randomly picked (no repeat of the last used one).

**`getAnswerFeedback(score, dimension)`** — returns dynamic feedback based on score level:
- Score 1-2 (low): "Hmm, there's room to grow here.", "That's honest — and that's the first step."
- Score 3 (mid): "Not bad at all!", "You're on the right track."
- Score 4-5 (high): "Now that's a smart move!", "You really know your stuff!"
- Dimension-specific variants too (e.g., for Saving: "Your saving game is strong!")

### 2. Update `AdaptivePlay.tsx`
- Import `getQuestionNarration` and `getAnswerFeedback`
- Replace static `speak("Read the question...")` with `speak(getQuestionNarration(currentQuestion.dimension, currentQuestion.category, questionsAnswered, estimatedTotal))`
- Replace static feedback narration with `speak(getAnswerFeedback(score, currentQuestion.dimension))`

### 3. Update `LevelPlay.tsx`
- Same pattern: replace static "picture this scenario" with dimension-aware dynamic prompts
- Replace static feedback with score-aware feedback

### 4. Update `RealityCheckPlay.tsx`
- Replace static narration with category-aware prompts from the generator
- Use score-aware feedback on answer

### Files
- **Create**: `src/utils/narrationPrompts.ts`
- **Modify**: `src/components/game/AdaptivePlay.tsx`, `src/components/game/LevelPlay.tsx`, `src/components/game/RealityCheckPlay.tsx`

