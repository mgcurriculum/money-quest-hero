

# Show Answer Distribution Percentages for All Questions

## Current State
The `QuestionInsights` component currently shows distribution only for a **single selected question** via a dropdown. The "All Questions" table only shows level, question text, response count, and avg score -- no distribution breakdown.

## Plan

### Update the "All Questions" table in `QuestionInsights.tsx`
Expand each question row to show answer option distribution with percentages inline. For each question in the ranked table:

- Add an expandable/collapsible section (or directly below each row) showing all answer options with their percentage and count
- Format: colored horizontal bars or simple text like `Yes: 30% (15) | No: 40% (20) | Expired: 20% (10) | Planning: 10% (5)`
- Use the existing `distribution` data from `computeQuestionStats` which already has `Record<string, number>` (option text to count)
- Calculate percentage as `(count / totalResponses * 100)`

### Implementation approach
- Convert the flat table into an accordion-style list or add a sub-row under each question showing the distribution
- Use simple horizontal progress bars with percentage labels for each option, making it visually clear
- Keep it compact so all questions are visible at a glance

### Files to modify
- `src/components/admin/QuestionInsights.tsx` -- add distribution percentages to the all-questions section

No database or backend changes needed.

