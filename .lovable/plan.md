

## Plan: Redesign Question Bank — 16 Engaging, Age-Appropriate Questions

### Expert Assessment of Current State

**Current:** 7 reality-check + 18 scenario = 25 questions. Too many reality-check questions (dry/factual), and scenario questions are only targeted at young adults (18-25 language/references).

### New Question Design (16 total, all 7 dimensions covered)

**Distribution:** Level 0 gets 4 questions (down from 7), Levels 1-6 get 2 questions each (down from 3). This keeps the assessment tight while covering all dimensions.

```text
Level 0: Financial Reality Check    — 4 questions (income, spending, savings, tracking)
Level 1: Earning Quest              — 2 questions (opportunity mindset, skill monetization)
Level 2: Spending Challenge         — 2 questions (impulse control, social pressure)
Level 3: Saving Mission             — 2 questions (windfall handling, goal-based saving)
Level 4: Debt Trap                  — 2 questions (BNPL awareness, loan app traps)
Level 5: Investment World           — 2 questions (investment attitude, wealth growth)
Level 6: Protection Shield          — 2 questions (digital fraud, scam awareness)
```

### Age-Appropriate Variations

Each question will have **4 age-group versions** inserted into the database with different:
- **Language/tone**: 18-25 uses Gen-Z slang & pop-culture refs; 26-39 uses career/family context; 40-59 uses mid-life/retirement context; 60+ uses simple, respectful language
- **Scenarios**: Mall/Instagram for youth → EMI/home loan for 26-39 → retirement/health for 40-59 → pension/scam calls for 60+
- **Currency amounts**: Scaled to age-appropriate income levels

### What Changes

**1. Update `src/data/questions.ts`** (hardcoded fallback)
- Reduce `realityQuestions` from 7 to 4 (remove debt, investment, insurance — these are covered in dedicated levels)
- Reduce each level's scenarios from 3 to 2, with tighter, more engaging narratives

**2. Insert 64 questions into the database** (16 questions × 4 age groups)
- Use the database insert tool to populate all questions with proper `level`, `category`, `age_groups`, and `options` fields
- Each question tagged to exactly ONE age group for clean tab separation

**3. Update `DOCUMENTATION.md`** to reflect new 16-question structure

### Sample Questions (showing age variations for one question)

**Level 2, Q1 — Impulse Control:**
- **18-25**: "🛍 DANGER ZONE! You spot THE perfect sneakers on sale. Your Impulse Monster whispers: 'Treat yourself!' You already own 5 pairs..."
- **26-39**: "🛍 Your partner spots a 50% off sale on a premium gadget. You already have a working one at home. The Impulse Monster attacks!"
- **40-59**: "🛍 A luxury home appliance is on a massive clearance sale. You don't really need it, but it looks premium. The Impulse Monster strikes!"
- **60+**: "🛍 A neighbourhood shop is offering a big discount on an expensive health gadget. You're not sure it works. What do you do?"

### Implementation Steps

1. Update hardcoded fallback questions in `src/data/questions.ts` (reduce to 16)
2. Craft and insert 64 age-specific questions into the `questions` table via database insert
3. Update documentation

### Files Modified
- `src/data/questions.ts` — reduce fallback to 16 questions (4 + 2×6)
- `DOCUMENTATION.md` — update question counts and samples
- Database: insert 64 new questions (16 per age group)

