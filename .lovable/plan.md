

## Plan: Scoring Algorithm Display & Admin-Editable Scoring Criteria

### What exists now
- Scoring config is hardcoded in `src/data/questions.ts`:
  - `dimensionWeights` — 7 weights summing to 1.0
  - `fqBands` — 6 score bands with min/max/level/meaning
  - `archetypes` — 14 archetypes (high/low per dimension)
- The `calculateFQScore` function uses these hardcoded values
- Settings page is essentially empty (just an info card)
- `admin_settings` table already exists with key/value JSONB storage and admin-only RLS

### What we'll build

#### 1. Store scoring config in `admin_settings` table
Save two keys:
- `dimension_weights` — `{ weights: [0.10, 0.13, 0.17, 0.17, 0.14, 0.14, 0.15] }`
- `score_bands` — `{ bands: [{ min: 0, max: 200, level: "Financial Beginner", meaning: "...", emoji: "🌱" }, ...] }`

Seed with current hardcoded defaults on first load if not present.

#### 2. Enhance Settings page with editable scoring UI
Two sections:

**Dimension Weights** — Table showing each dimension name, icon, and an editable weight input. Total must equal 1.0 (validated). Save button persists to `admin_settings`.

**Score Bands** — Editable table with columns: Min Score, Max Score, Band Name, Meaning, Emoji. Admin can adjust thresholds and labels. Save button persists to `admin_settings`.

Visual formula display: `FQ Score = (Σ normalized[i] × weight[i]) × 10 → 0–1000`

#### 3. Load scoring config dynamically
Create a hook `useScoringConfig` that:
- Fetches `dimension_weights` and `score_bands` from `admin_settings`
- Falls back to hardcoded defaults if not found
- Used by `calculateFQScore` in the game flow and by the dashboard analytics

Update `ReportScreen.tsx` to use dynamic weights/bands instead of hardcoded ones.

### Files to modify/create

| File | Changes |
|------|---------|
| `src/pages/admin/Settings.tsx` | Full rewrite: editable weights table, bands table, formula display |
| `src/hooks/useScoringConfig.ts` | New: fetch scoring config from admin_settings with fallback |
| `src/components/game/ReportScreen.tsx` | Use dynamic scoring config from hook |
| `src/data/questions.ts` | Keep hardcoded values as defaults (no changes needed) |

### No database changes needed
The `admin_settings` table already supports arbitrary key-value storage with admin-only write access.

