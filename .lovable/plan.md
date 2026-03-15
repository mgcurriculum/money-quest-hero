

## Plan: Update DOCUMENTATION.md to Match Current Code

### Changes

**Section 1 - Overview**
- Rename "Money Quest" to "Finance Quest" throughout

**Section 2 - Game Flow**
- Update Level Play description: "Level 0: 7 reality-check questions; Levels 1–6: 3 scenario-based questions each (25 total questions)"

**Section 3 - Player Profile Fields**
- Add note that `status` and `incomeType` are collected via UI selection (moved from Level 0)

**Section 4 - Level 0 Questions**
- Remove Questions 1-2 (Current Stage of Life, Income Source) — these are now collected in Profile screen step 2
- Remove Questions 10-11 (Financial Knowledge Growth, Money Journey Commitment) — these are now in the Reflection screen
- Update question count from 11 to 7
- Renumber remaining questions 1-7

**Section 5 - Scoring Criteria**
- Update Level 0: minScore = 7, maxScore = 35

**Section 9 - Reflection Options**
- Add the "Financial Mindset" step (interest level question with 5 options) before the reflection goal selection

**Section 10 - State Shape**
- Fix comment: `currentQuestion: 0–6 (Level 0) or 0–2 (Levels 1–6)`

### Files to Change
- `DOCUMENTATION.md` — single file update

