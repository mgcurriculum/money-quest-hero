

### Task: Add Profile Numbers (1-19) and Completion Status Indicators

**Files to change:**

#### 1. `src/data/questions.ts`
- Add a `getProfileNumber(profileCode)` function that returns the 1-based index from the ordered list of all 19 profile codes.
- Add a `getProfileWithNumber(profileCode)` helper returning `{ number, code, label }`.

#### 2. `src/pages/admin/Questions.tsx`
- **Profile selector dropdown**: Show profile number before each entry, e.g. `#1 A1_SAL — Salaried (18-25)`
- **Add a Profile Overview grid** above the question list: fetch question counts for ALL 19 profiles in one query, then display a compact grid/table showing:
  - `#` (1-19)
  - Profile Code
  - Age Group + Role
  - Question count (e.g. `18/18`)
  - Status badge: green `✓ Complete` if 18, yellow `⚠ Incomplete` if 1-17, red `✗ Missing` if 0
  - Clicking a row selects that profile
- The overview query: `supabase.from('questions').select('profile_code').then group/count client-side`

This gives admins a quick at-a-glance view of which profiles are ready and which need attention.

