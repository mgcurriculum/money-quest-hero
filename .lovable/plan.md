

## Plan: Age Group Filter for Question Management

### What Changes

Update `src/pages/admin/Questions.tsx` to add an **Age Group filter** alongside the existing Level filter. The admin selects an age group first, then sees only questions tagged for that group — and can edit/add questions scoped to that group.

### Changes to `src/pages/admin/Questions.tsx`

1. **Add `filterAgeGroup` state** (default `'all'`) with a Select dropdown next to the Level filter
2. **Filter the question list** by both level AND age group — show only questions whose `age_groups` array includes the selected group
3. **When creating a new question**, pre-select the currently filtered age group instead of all groups
4. **Show per-group counts** in each level card header (e.g., "5 questions for 18-25")
5. **Add a visual indicator** on each question row showing which age groups it belongs to (already exists as badges — keep as-is)

### UI Layout

```text
[Filter by Age Group: All | 18-25 | 26-39 | 40-59 | 60+]  [Filter by Level: All | Level 0 | ...]  [+ Add Question]

Level 0 — Reality Check (3 questions for 18-25)
  1. Question text...  [18-25] [26-39]  [toggle] [edit] [delete]
  2. ...
```

### Files
- `src/pages/admin/Questions.tsx` — add age group filter state, filter logic, and pre-selection on create

