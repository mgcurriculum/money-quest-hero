

## Plan: Add Level 0 — Financial Reality Check + FQ Test Branding

### Overview
Add an 11-question "Financial Reality Check" as Level 0 before the existing 6 scenario-based levels. This captures the player's real financial situation. Also brand "FQ Test" prominently throughout.

### 1. Update Question Data (`src/data/questions.ts`)

- Add a new `RealityQuestion` interface (simpler than `Scenario` — just question text + options, no scene/character)
- Add `realityQuestions` array with all 11 questions and their 5 options (scored 1–5)
- Insert a new Level 0 entry into `levels` array with title "Financial Reality Check", shifting existing levels to indices 1–6
- Add "Financial Reality" as a new 7th dimension label/icon
- Update `dimensionWeights` to 7 values summing to 1.0:
  - Financial Reality: 0.10
  - Earning: 0.13, Spending: 0.17, Saving: 0.17, Debt: 0.14, Investment: 0.14, Safety: 0.15
- Update `archetypes` array with a 7th entry for Financial Reality (high: "Reality Checker", low: "Reality Explorer")
- Update `traitProfiles` with 7th dimension
- Update `calculateNormalizedScore` — already handles variable question counts (uses `vals.length`)
- Update `calculateFQScore` to iterate over 7 levels instead of 6

### 2. Create Level 0 Play Component (`src/components/game/RealityCheckPlay.tsx`)

- Simpler UI than `LevelPlay` (no scene/character cards — just question + 5 option buttons)
- Shows question number (1–11), progress bar
- Same feedback popup pattern as LevelPlay
- After all 11 questions, completes level and returns to journey map

### 3. Update LevelPlay (`src/components/game/LevelPlay.tsx`)

- Adjust to work with shifted level indices (levels 1–6 for scenarios)
- Keep existing scenario UI unchanged

### 4. Update Journey Map (`src/components/game/JourneyMap.tsx`)

- Show 7 levels instead of 6
- Level 0 displayed as "Level 0 — Financial Reality Check" 
- Progress bar: `completedLevels.length / 7`
- All-completed check: `completedLevels.length === 7`
- Brand header: emphasize "FQ Test" as the test name

### 5. Update Game Context (`src/context/GameContext.tsx`)

- `completedLevels` now tracks 0–6
- No structural changes needed — already supports arbitrary level counts

### 6. Update Index Page (`src/pages/Index.tsx`)

- Route to `RealityCheckPlay` when `currentLevel === 0` and step is `level`
- Route to `LevelPlay` for levels 1–6

### 7. Update Report Screen (`src/components/game/ReportScreen.tsx`)

- Show 7 dimension bars instead of 6
- Radar chart with 7 axes
- Brand: "FQ Test Score" instead of "Financial Quotient Score"

### 8. FQ Test Branding

- Update `WelcomeScreen`, `JourneyMap`, `ReportScreen`, `ReflectionScreen` to prominently feature "FQ Test" as the brand name
- Share text: "Take the FQ Test!"

### 9. Update Documentation (`DOCUMENTATION.md`)

- Add Level 0 section with all 11 questions
- Update scoring section with new 7-dimension weights
- Highlight "FQ Test" as the official brand name throughout
- Add Financial Reality archetype definitions

### Key Scoring Change

```text
Before (6 levels):
  Earning 0.15, Spending 0.20, Saving 0.20, Debt 0.15, Investment 0.15, Safety 0.15

After (7 levels):
  Reality 0.10, Earning 0.13, Spending 0.17, Saving 0.17, Debt 0.14, Investment 0.14, Safety 0.15
  Total = 1.00
```

Level 0 raw score range: 11–55 (11 questions × 1–5 each), normalized to 0–100 using the same formula.

