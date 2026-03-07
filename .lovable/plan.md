

## Plan: Tab-Based Age Group Question Management

### Current Problem
Questions are shared across age groups with a filter dropdown. The user wants each age group to have its own dedicated tab with its own question list — no shared questions across groups.

### UI Redesign

```text
[18-25]  [26-39]  [40-59]  [60+]           ← Tabs (top-level)

  [+ Add Question]                          ← Adds question tagged ONLY to active tab's age group

  Level 0 — Reality Check (3 questions)
    1. Question text...  [toggle] [edit] [delete]
    2. ...

  Level 1 — Earning Quest (2 questions)
    1. ...
```

### Changes to `src/pages/admin/Questions.tsx`

1. **Replace the age group dropdown filter with `<Tabs>`** — one tab per age group (`18-25`, `26-39`, `40-59`, `60+`)
2. **Filter questions by active tab's age group** — show only questions whose `age_groups` array includes the selected tab
3. **When creating a new question**, pre-select ONLY the active tab's age group (not all groups)
4. **Remove the separate age group filter dropdown** — the tab itself is the filter
5. **Keep the Level filter dropdown** inside each tab for further narrowing
6. **Remove age group badges from question rows** since the tab already implies the group — but keep them in the edit dialog for cross-assigning if needed

### Files Modified
- `src/pages/admin/Questions.tsx` — replace dropdown with Tabs component, update filtering and creation defaults

