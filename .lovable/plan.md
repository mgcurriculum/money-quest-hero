

## Plan: Remove Questions-Per-Level Settings, Auto-Calculate

### What Changes

Remove the manual "questions per level" configuration. Instead, the game will automatically use **all active questions** for the player's age group per level — no limit, no random selection.

### Files Modified

**1. `src/pages/admin/Settings.tsx`** — Remove the questions-per-level card entirely. If no other settings remain, replace with a placeholder or remove the page.

**2. `src/hooks/useQuestions.ts`** — Remove the `questionsPerLevel` state, the `admin_settings` fetch, and the shuffle/limit logic. `getQuestionsForLevel` will simply return all active questions filtered by level + age group.

**3. `src/pages/admin/Dashboard.tsx`** (if it links to Settings) — Check if Settings nav link should remain.

### Scope
- Settings page: Remove the questions-per-level card (keep page shell for future settings)
- useQuestions hook: Remove `questionsPerLevel` state and the associated DB query + slicing logic
- All active questions for the matching level and age group will be served to players

