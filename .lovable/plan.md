

## Current State

**Data being saved** (in `game_sessions`): Name, age group, exact age, gender, phone, country, state, district, role, income type, profile code, enriched answers JSON (individual question details + dimension scores), FQ score, band level, reflection answer, campaign ID, email.

**CSV export currently includes**: Name, Age, Gender, Phone, State, District, Status, Income Type, FQ Score, Band, Primary/Secondary Archetype, Reflection, Date.

**What's missing from CSV**: Country, Email, Profile Code, exact age number, campaign info, individual question answers (Q1-Q18 with selected option and score), and dimension-level scores.

**Current filters**: Age Group, Band, simple date-from/date-to inputs.

---

## Plan

### 1. Enhance CSV Export to include ALL collected data
**File**: `src/pages/admin/Dashboard.tsx`

- Add these columns to the CSV headers and row mapping:
  - `Country`, `Email`, `Profile Code`, `Age (exact)`, `Campaign ID`
  - For each question in the enriched answers JSON: `Q1 Answer`, `Q1 Score`, `Q2 Answer`, `Q2 Score`, ... up to Q18
  - 6 dimension percentage scores: `Earning %`, `Spending %`, `Saving %`, `Borrowing %`, `Investing %`, `Protecting %`
- Parse the `answers` JSONB column to extract `detailed` array and `dimensionScores` array per session

### 2. Add richer date/time filters
**File**: `src/pages/admin/Dashboard.tsx`

- Replace the plain date inputs with a filter dropdown offering preset ranges: Today, This Week, This Month, This Year, Custom Range
- Keep the custom from/to date pickers for the "Custom Range" option
- Add a quick month/year selector for filtering by specific month

### 3. Add campaign filter
**File**: `src/pages/admin/Dashboard.tsx`

- Fetch campaigns list and add a campaign filter dropdown alongside existing filters
- Filter sessions by `campaign_id`

No database changes needed — all data is already being saved. This is purely a dashboard UI enhancement.

