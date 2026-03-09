

# Plan: Populate Adaptive Question Bank (~105 Questions)

## Overview
Insert ~105 questions into the `questions` table via database migration, covering all 7 financial dimensions with branching rules, difficulty levels, and age-appropriate content for the 18-25 age group (primary target). Questions use professional Indian English with gamified scenarios — no slang.

## Question Distribution

| Level | Dimension | Questions | Difficulty Spread |
|-------|-----------|-----------|-------------------|
| 0 | Financial Reality | 10 | 4 easy, 3 medium, 3 hard |
| 1 | Earning Mindset | 15 | 5 easy, 5 medium, 5 hard |
| 2 | Spending Discipline | 20 | 7 easy, 7 medium, 6 hard |
| 3 | Saving Behaviour | 20 | 7 easy, 7 medium, 6 hard |
| 4 | Debt Awareness | 15 | 5 easy, 5 medium, 5 hard |
| 5 | Investment Awareness | 15 | 5 easy, 5 medium, 5 hard |
| 6 | Financial Safety | 10 | 4 easy, 3 medium, 3 hard |

**Total: 105 questions**, each with 5 options scored 1-5 (low to high financial awareness).

## Branching Rules Strategy

Each question will have `branch_low`, `branch_mid`, `branch_high` values following the PRD logic:
- **Low score (0-1)**: Branch to a foundational/related dimension (e.g., poor spending → debt awareness)
- **Mid score (2)**: Stay in same dimension or move sequentially
- **High score (3-4)**: Skip ahead to an advanced dimension (e.g., strong saving → investment)

Key branching patterns:
- Level 0 (Reality) low → stays at 0, mid → 1, high → 2
- Level 1 (Earning) low → 0, mid → 2, high → 3
- Level 2 (Spending) low → 4 (debt), mid → 3, high → 5
- Level 3 (Saving) low → 2, mid → 4, high → 5
- Level 4 (Debt) low → 2, mid → 5, high → 6
- Level 5 (Investment) low → 3, mid → 6, high → 6
- Level 6 (Safety) low → 4, mid → 6, high → 6

## Question Content Style
- Professional Indian English, age-appropriate for 18-25
- Real-life financial scenarios (UPI, online shopping, gig work, college fees, roommate expenses)
- Currency in INR with amounts relevant to young Indians
- 5 options per question with emoji, scored progressively (option 1 = lowest awareness, option 5 = highest)
- Categories describe the focus area (e.g., "Income Tracking", "Impulse Control", "Emergency Fund")

## Implementation
- Single large SQL migration inserting all 105 questions
- All questions set to `age_groups = ARRAY['18-25']` (the primary segment; other age groups can be added later via admin panel or CSV import)
- `is_active = true`, with appropriate `sort_order` within each level
- Existing hardcoded fallback questions in `data/questions.ts` remain untouched as fallback

## Files Changed
- **New migration file** — single SQL INSERT with 105 question rows

No code file changes needed — the adaptive engine already reads from the database.

