

## Problem

**Question-wise analytics show nothing** because all 10 existing sessions store answers in the old format (`{0: {0: 4, 1: 3}, ...}` — just raw scores), with no `detailed` array. The `computeQuestionStats` function only reads from `answers.detailed`, so it returns empty for every session.

**Dashboard is also too complex** — too many filters and dense charts for a simple admin view.

## Plan

### 1. Fix question analytics for legacy sessions
Update `computeQuestionStats` in `dashboardAnalytics.ts` to reconstruct question data from the `raw` format by matching level/index against the hardcoded questions in `data/questions.ts`. This way all 10 existing sessions will populate the Question Insights tab.

- Import `realityQuestions` and `levels` from `data/questions.ts`
- When `detailed` is empty, iterate over `raw` keys (level -> question index -> score) and look up the question text and options from the hardcoded data
- Reconstruct the selected option from the score index

### 2. Apply same fix to dimension scores
The `getDimensionScores` fallback already computes from raw — verify it works. The `computeDimensionByAgeGroup` and `computeDimensionAverages` should work since they use `getDimensionScores`.

### 3. Simplify the Dashboard UI
- **Reduce filters**: Keep only Age Group, Band, and Date range. Remove Gender, State, Status, Income filters (too granular).
- **Simplify Overview tab**: Keep stat cards (Total Sessions, Avg Score) and the sessions table. Remove or collapse the charts into a simpler layout.
- **Simplify Question Insights**: Keep the question selector with distribution chart, and the ranked questions table. Remove the heatmap.
- **Simplify Financial Expert**: Keep dimension health cards and risk indicators. Remove archetype pairings and reflection summary charts.
- **Cleaner layout**: Less visual clutter, bigger text, fewer cards.

### Files to modify

| File | Changes |
|------|---------|
| `src/utils/dashboardAnalytics.ts` | Add legacy raw-to-detailed reconstruction in `computeQuestionStats` |
| `src/pages/admin/Dashboard.tsx` | Remove Gender/State/Status/Income filters |
| `src/components/admin/DashboardOverview.tsx` | Simplify to stats + table |
| `src/components/admin/QuestionInsights.tsx` | Remove heatmap table |
| `src/components/admin/FinancialExpertView.tsx` | Remove archetype pairings and reflection charts |

