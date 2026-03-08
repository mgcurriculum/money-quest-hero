

# Add Question Answer Distribution to Campaign Dashboard

## What's needed
The Campaign Dashboard currently fetches only basic session fields (name, email, score, etc.) but not the `answers` JSON column. To show per-question answer distribution percentages, we need to:

## Changes

### 1. Update `CampaignDashboard.tsx`
- Add `answers` to the `select()` query for `game_sessions`
- Update the `Session` interface to include `answers`
- Import and render the existing `QuestionInsights` component (already built for the main dashboard) which shows:
  - A dropdown to select any question and see its answer distribution as a bar chart
  - A ranked table of all questions with response counts and average scores
- Cast sessions to the format expected by `QuestionInsights` (it expects `Tables<'game_sessions'>`)

### 2. No new components needed
The existing `QuestionInsights` component and `computeQuestionStats` utility already handle:
- Parsing enriched answer data from session JSON
- Computing per-option counts (distribution)
- Displaying bar charts with response counts per option
- The distribution data already contains counts; we just need to also show percentages

### 3. Add percentage display to `QuestionInsights`
- In the bar chart tooltip and/or distribution display, show percentage alongside count (count / totalResponses * 100)

This reuses existing analytics infrastructure with minimal new code.

