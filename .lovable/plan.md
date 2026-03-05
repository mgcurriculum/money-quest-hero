

## Plan: Create Documentation File

Create `DOCUMENTATION.md` at the project root with comprehensive documentation covering:

### Contents

**1. Overview** — Brief description of Money Quest / FQ Test by FinQuo Versity

**2. Game Flow** — The 7-step progression: Welcome → Consent → Profile → Journey Map → Level Play → Reflection → Report

**3. Player Profile Fields** — name, age, gender, phone, country, state, district, status, incomeType

**4. All 6 Levels with Full Questions** — Each level listed with title, theme, dimension measured, and all 3 scenarios with their 5 options (scored 1–5, option 1 = lowest, option 5 = highest)

**5. Scoring Criteria**
- Each option scores 1–5 (first option = 1, last = 5)
- Per-level normalized score: `((userScore - minScore) / (maxScore - minScore)) × 100`
- Dimension weights: Earning 0.15, Spending 0.20, Saving 0.20, Debt 0.15, Investment 0.15, Safety 0.15
- FQ Score = weighted total × 10 (range 0–1000)

**6. FQ Score Bands** — All 6 bands with ranges and meanings

**7. 12 Financial Personality Archetypes** — 2 per dimension (high ≥50% and low <50%), with name, trait, strength/risk, and quest

**8. Trait Profiles** — 5-tier trait labels per dimension

**9. Reflection Options** — The 6 post-game reflection choices

**10. Technical Architecture** — Brief note on React + TypeScript + Tailwind stack, GameContext state management

### Implementation
Single new file: `DOCUMENTATION.md` — no existing files modified.

