

## Analysis

The defensive guard added in the last fix (`if (!d.dimension || !d.question) return;`) is correct but insufficient. The Question Insights tab renders blank/broken, suggesting a **runtime crash** in the component. Based on code review, the likely causes are:

1. **Duplicate `SelectItem` values**: `q.question.substring(0, 60)` is used as both `key` and `value` for Radix UI's `Select`. If two different questions share the same first 60 characters, this creates duplicate values which crashes the Radix Select component silently.

2. **Potential `undefined` in `selectedOption`**: If any `d.selectedOption` is null/undefined (rather than missing), it becomes the string `"undefined"` as a distribution key — not a crash, but corrupts data.

3. **No error boundary**: If `computeQuestionStats` or the rendering throws for any reason, the entire tab goes blank with no fallback.

## Plan

### 1. Fix duplicate key/value issue in QuestionInsights (primary fix)
- Use a unique identifier (index or combination of dimension + question substring) as the `SelectItem` value instead of just `q.question.substring(0, 60)`
- Use the index into `questionStats` array as the Select value to guarantee uniqueness

### 2. Add try-catch error handling in QuestionInsights
- Wrap the `useMemo` computation in a try-catch that returns `[]` on error
- Add `console.error` logging so errors become visible
- Show a fallback error message in the UI if stats computation fails

### 3. Add guard for undefined selectedOption in computeQuestionStats
- Skip entries where `d.selectedOption` is falsy to prevent "undefined" keys in distribution

### Files to edit
- `src/components/admin/QuestionInsights.tsx` — fix Select values, add error handling
- `src/utils/dashboardAnalytics.ts` — add selectedOption guard

