

## Plan: Enhanced Admin Dashboard with Question-Level Analytics

### What we have now
- `game_sessions` table already stores all answers as a JSON blob: `{ 0: { 0: 3, 1: 4 }, 1: { 0: 2, 1: 5 }, ... }` (level -> question index -> score 1-5)
- Dashboard shows basic stats: total sessions, avg FQ score, band distribution, and a sessions table
- No question-level analysis exists

### What we'll build

#### 1. Save question text alongside answers (data enrichment)
Currently only scores (1-5) are saved, not the question text or chosen option text. We need to store richer answer data so admins can see exactly what was answered.

**Approach**: Update the save logic in `ReportScreen.tsx` to include question texts and selected option texts in the `answers` JSON. The existing `extractQuestionsAndAnswers` utility already does this for the PDF — we'll reuse it for the database save.

New answers format:
```json
{
  "detailed": [
    { "level": 0, "question": "How much money...", "category": "Real Income Level", "selectedOption": "₹10,000 – ₹25,000", "score": 3 },
    ...
  ],
  "raw": { "0": { "0": 3, "1": 4 }, ... }
}
```

#### 2. Enhanced Dashboard with tabs
Restructure the Dashboard page into **3 tabs**:

**Tab 1 — Overview** (existing + enhanced)
- Existing stat cards + filters (age, band, date, gender, state, status, income type)
- Band distribution chart
- Score trend over time chart (line chart by date)
- Archetype distribution pie/bar chart
- Geographic breakdown (by state)
- Sessions table (existing)

**Tab 2 — Question Insights**
- Dropdown to select a specific question (grouped by level/dimension)
- For the selected question: bar chart showing distribution of answer choices (how many picked each option)
- Average score per question across all filtered sessions
- Table: all questions ranked by average score (lowest = weakest financial area)
- Heatmap-style view: dimensions vs age groups showing average scores

**Tab 3 — Financial Expert View**
- Dimension-wise average scores with color coding (red < 40, yellow 40-70, green > 70)
- "Weakest Areas" summary: which dimensions score lowest, broken down by age group
- "Risk Indicators": percentage of players scoring 1-2 on critical questions (debt, scams)
- Archetype pairing analysis: most common primary+secondary archetype combos
- Reflection answer word cloud / summary of most chosen reflection options

#### 3. Detailed filters (applied globally across all tabs)
Add filters for: gender, state, player status, income type — in addition to existing age, band, and date filters.

#### 4. Session detail view
Click a session row to see a modal/drawer with full question-by-question breakdown for that player.

### Files to create/modify

| File | Action |
|------|--------|
| `src/components/game/ReportScreen.tsx` | Update save logic to include detailed Q&A data |
| `src/pages/admin/Dashboard.tsx` | Major rewrite: add tabs, question insights, expert view |
| `src/components/admin/DashboardOverview.tsx` | New: overview tab content |
| `src/components/admin/QuestionInsights.tsx` | New: question-level analytics |
| `src/components/admin/FinancialExpertView.tsx` | New: expert-oriented analytics |
| `src/components/admin/SessionDetailModal.tsx` | New: per-session Q&A detail view |
| `src/utils/dashboardAnalytics.ts` | New: shared analytics computation functions |

### Technical notes
- All analytics are computed client-side from the existing `game_sessions` data (no new tables needed)
- The `answers` JSON already contains raw scores; we'll parse them against the questions table/hardcoded data to reconstruct Q&A pairs for older sessions
- For older sessions without detailed answers, we'll fall back to matching raw scores against known questions by level
- No database schema changes required — the `answers` JSONB column is flexible enough
- Uses existing Recharts library for all visualizations

