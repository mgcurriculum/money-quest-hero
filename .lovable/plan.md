

# Phase 1: Adaptive Branching Engine — Database + Core Engine

## Overview
Add branching metadata to questions, build an adaptive question selection engine, and update the game flow so questions are dynamically chosen based on previous answers. The Journey Map becomes a read-only progress indicator. The existing fixed flow remains as fallback when no branching data exists.

## 1. Database Migration

Add branching and difficulty columns to the `questions` table:

```sql
ALTER TABLE questions ADD COLUMN difficulty integer DEFAULT 2;        -- 1=easy, 2=medium, 3=hard
ALTER TABLE questions ADD COLUMN branch_low integer DEFAULT NULL;     -- next level on low score (0-1)
ALTER TABLE questions ADD COLUMN branch_mid integer DEFAULT NULL;     -- next level on mid score (2)
ALTER TABLE questions ADD COLUMN branch_high integer DEFAULT NULL;    -- next level on high score (3-4)
ALTER TABLE questions ADD COLUMN dimension text DEFAULT NULL;         -- explicit dimension label
```

Also add an `assessment_mode` setting to `admin_settings` (inserted via data tool) to toggle adaptive vs fixed mode globally.

## 2. Adaptive Engine Hook — `src/hooks/useAdaptiveEngine.ts` (new file)

Core logic:
- Maintains a queue of dimensions to cover (all 7 must be visited)
- After each answer, applies branching rules:
  - `score <= 1` → `branch_low` (or next sequential level)
  - `score == 2` → `branch_mid`
  - `score >= 3` → `branch_high`
- Selects the next question from the target level, filtering by age group, excluding already-asked questions
- Tracks per-dimension question count and scores
- Stop conditions: all 7 dimensions covered AND minimum 15 questions answered, OR max 18 reached
- Falls back to sequential level progression if no branching data exists on questions

Key interface:
```typescript
interface AdaptiveState {
  currentQuestion: DBQuestion | null;
  questionsAnswered: number;
  dimensionsCovered: Set<number>;
  isComplete: boolean;
  dimensionScores: Record<number, number[]>;
}
```

## 3. Update GameContext — `src/context/GameContext.tsx`

- Add `assessmentMode: 'fixed' | 'adaptive'` to state
- Add `adaptiveAnswers: { questionId: string; level: number; score: number }[]` array for tracking adaptive answers (separate from fixed `answers` object)
- Add actions: `SET_ASSESSMENT_MODE`, `ADD_ADAPTIVE_ANSWER`, `SET_ADAPTIVE_COMPLETE`
- Keep existing fixed-flow logic untouched for backward compatibility

## 4. New Adaptive Play Screen — `src/components/game/AdaptivePlay.tsx` (new file)

- Single unified question screen (replaces separate RealityCheckPlay/LevelPlay for adaptive mode)
- Uses `useAdaptiveEngine` to get the current question and submit answers
- Shows dimension badge + question number (e.g., "Question 7 of ~16")
- Same visual style as existing LevelPlay (glass cards, emoji feedback, XP animation)
- On completion, transitions to reflection screen

## 5. Update Journey Map — `src/components/game/JourneyMap.tsx`

- In adaptive mode: render as read-only progress indicator
- Show which dimensions have been covered (filled vs outline icons)
- No tap-to-play; displayed briefly before adaptive play begins or as an overlay/sidebar
- In fixed mode: unchanged behavior

## 6. Update Game Flow — `src/pages/Index.tsx`

- After profile, check `assessmentMode`:
  - `'adaptive'` → show Journey Map briefly → `AdaptivePlay`
  - `'fixed'` → existing flow (RealityCheckPlay → LevelPlay)

## 7. Update Scoring — `src/data/questions.ts` + `src/hooks/useScoringConfig.ts`

- `calculateNormalizedScore` updated to accept variable question counts per dimension (already handles this since it uses `vals.length`)
- Scoring from adaptive answers grouped by dimension, not by fixed level index
- Report screen reads from `adaptiveAnswers` when in adaptive mode

## 8. Update `useQuestions.ts`

- Add method `getNextAdaptiveQuestion(level, ageGroup, excludeIds)` that fetches a single question with branching metadata
- Return branching fields alongside question data

## Files to Create
- `src/hooks/useAdaptiveEngine.ts`
- `src/components/game/AdaptivePlay.tsx`

## Files to Modify
- `src/context/GameContext.tsx` — add adaptive state/actions
- `src/hooks/useQuestions.ts` — add adaptive query method
- `src/pages/Index.tsx` — route to adaptive flow
- `src/components/game/JourneyMap.tsx` — read-only mode
- `src/components/game/ReportScreen.tsx` — support adaptive scoring
- `src/data/questions.ts` — no structural changes needed (scoring already flexible)

## What's NOT in Phase 1
- Admin UI for configuring branching rules (use CSV import or direct DB)
- Populating the 105-question bank
- API endpoints (this is a client-side SPA)
- AI recommendations, personalized advice
- Confidence-level stop conditions (use simple count-based rules)

