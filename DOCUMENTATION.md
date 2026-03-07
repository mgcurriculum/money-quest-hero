# FQ Test – Finance Quest by FinQuo Versity

## 1. Overview

**FQ Test** (Finance Quest) is a gamified Financial Quotient assessment tool built by **FinQuo Versity**. Players navigate through 7 themed levels — starting with a Financial Reality Check followed by 6 real-life financial scenario levels — to discover their financial personality, strengths, and areas for growth. The result is a personalized FQ Test Score (0–1000) along with financial personality archetypes and actionable quests.

---

## 2. Game Flow

```
Welcome → Consent → Profile → Journey Map → Level Play (×7) → Reflection → Report
```

| Step | Screen | Description |
|------|--------|-------------|
| 1 | **Welcome** | Introduction to the FQ Test and language selection |
| 2 | **Consent** | Data privacy consent before proceeding |
| 3 | **Profile** | Player fills in demographic details (Step 1: personal info, Step 2: status & income type) |
| 4 | **Journey Map** | Visual map showing all 7 levels; player picks a level to play |
| 5 | **Level Play** | Level 0: 4 reality-check questions; Levels 1–6: 2 scenario-based questions each (**16 total**) |
| 6 | **Reflection** | Financial mindset question + financial goal selection |
| 7 | **Report** | FQ Test Score, personality archetypes, dimension breakdown, and quests |

---

## 3. Question Design (16 Questions × 4 Age Groups = 64 Total)

### Distribution

| Level | Title | Questions | Dimension |
|-------|-------|-----------|-----------|
| 0 | 📋 Financial Reality Check | 4 | Financial Reality |
| 1 | 💼 The Earning Quest | 2 | Earning Mindset |
| 2 | 💳 Spending Challenge | 2 | Spending Discipline |
| 3 | 💰 Saving Mission | 2 | Saving Behaviour |
| 4 | 🧾 Debt Trap | 2 | Debt Awareness |
| 5 | 📈 Investment World | 2 | Investment Awareness |
| 6 | 🛡️ Protection Shield | 2 | Financial Safety |
| **Total** | | **16** | **7 dimensions** |

### Age-Appropriate Variations

Each of the 16 questions has **4 age-group versions** with:
- **18-25**: Gen-Z tone, pop-culture references, lower currency amounts
- **26-39**: Career/family context, moderate currency amounts
- **40-59**: Mid-life/retirement context, higher currency amounts
- **60+**: Simple respectful language, pension/health focus

### Level 0: Financial Reality Check (4 Questions)

| Q# | Category | Focus |
|----|----------|-------|
| 1 | Real Income Level | Monthly income from all sources |
| 2 | Spending Reality | Monthly spending habits |
| 3 | Savings Status | Current savings amount |
| 4 | Financial Habit Check | Expense tracking frequency |

### Levels 1–6: Scenario-Based (2 Questions Each)

| Level | Q1 Focus | Q2 Focus |
|-------|----------|----------|
| 1 – Earning | Opportunity mindset | Skill monetization |
| 2 – Spending | Impulse control | Social pressure spending |
| 3 – Saving | Windfall handling | Goal-based saving |
| 4 – Debt | BNPL/easy credit awareness | Predatory lending traps |
| 5 – Investment | Investment attitude | Wealth growth strategy |
| 6 – Protection | Digital fraud response | Scam awareness & action |

---

## 4. Scoring

### Per-Question: 5 options scored 1–5 (low → high financial awareness)

### Per-Level Normalized Score (0–100):
```
normalizedScore = ((userScore - minScore) / (maxScore - minScore)) × 100
```

### Dimension Weights

| Dimension | Weight |
|-----------|--------|
| 📋 Financial Reality | 0.10 |
| 💼 Earning Mindset | 0.13 |
| 💳 Spending Discipline | 0.17 |
| 💰 Saving Behaviour | 0.17 |
| 🧾 Debt Awareness | 0.14 |
| 📈 Investment Awareness | 0.14 |
| 🛡️ Financial Safety | 0.15 |

### FQ Test Score = (Σ normalizedScore[i] × weight[i]) × 10 → Range: 0–1000

---

## 5. Score Bands

| Score | Level | Emoji |
|-------|-------|-------|
| 0–199 | Financial Beginner | 🌱 |
| 200–399 | Financial Explorer | 🧭 |
| 400–599 | Developing Money Skills | 📚 |
| 600–799 | Financially Smart | 🧠 |
| 800–899 | Wealth Builder | 🏗️ |
| 900–1000 | Financial Master | 👑 |

---

## 6. Personality Archetypes (14 total — 2 per dimension)

High (≥50%) and Low (<50%) archetypes per dimension with traits, strengths/risks, and quests.

---

## 7. Technical Architecture

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | React Context + useReducer |
| Routing | React Router v6 |
| Backend | Lovable Cloud |
| Build | Vite |

### Key Files

| File | Purpose |
|------|---------|
| `src/context/GameContext.tsx` | Global game state |
| `src/data/questions.ts` | Fallback questions, scoring logic, archetypes |
| `src/hooks/useQuestions.ts` | DB-first question loading with age-group filtering |
| `src/pages/Index.tsx` | Main game page |
| `src/components/game/*.tsx` | Screen components |
