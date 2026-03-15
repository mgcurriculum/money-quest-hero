

## Analysis

After investigating the data and code, I found that the `computeQuestionStats` function in `dashboardAnalytics.ts` processes answers from all sessions, including **13 legacy sessions** that have an older answer format (with `category`, `index`, `level` fields but **no `dimension` field**). While this doesn't crash the function, it creates entries with `dimension: "undefined"` that pollute the results.

However, the primary issue is likely that the component silently fails or shows empty results when accessing the "Question Insights" tab. There are two potential root causes:

1. **Old-format sessions creating noise**: 13 sessions have a legacy answer structure without `dimension`, producing "undefined" dimension entries
2. **Possible silent error**: If `d.question` is ever `undefined` in an old-format session, calling `.substring(0,60)` on it would throw and silently crash the component

## Plan

### 1. Add defensive guards in `computeQuestionStats` (dashboardAnalytics.ts)
- Skip detailed answer entries that don't have both `dimension` and `question` fields
- Add a guard: `if (!d.dimension || !d.question) return;` inside the `detailed.forEach` loop

### 2. Add error boundary / fallback in QuestionInsights component
- Wrap the computation in a try-catch or add null checks to prevent silent crashes
- Add console logging when question stats are computed to help debug

### 3. Verify the admin authentication flow
- Ensure the Dashboard page fetches sessions only when the admin is authenticated (the RLS policy requires `has_role(auth.uid(), 'admin')` for full SELECT access)
- Without admin auth, only sessions with `player_phone IS NOT NULL` are returned, which should still include the 32 new-format sessions

The core fix is in step 1 — filtering out legacy-format answers that lack the required `dimension` field.

