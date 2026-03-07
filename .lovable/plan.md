

## Plan: Replace Split Dimension Bars with Single Total Progress Bar

**What changes:** Replace the 7 individual dimension score bars (lines 189-209 in `ReportScreen.tsx`) with a single overall percentage progress bar showing the total FQ score as a percentage (fqScore/1000 × 100).

### Changes to `src/components/game/ReportScreen.tsx`

- **Remove** the "Dimension Score Bars" section (the `.map()` over `dimensionLabels` rendering 7 separate glass cards with individual progress bars)
- **Replace with** a single "Overall Score" card containing:
  - Label: "Overall Evaluation" with the total percentage (e.g. "72%")
  - One animated progress bar showing `fqScore / 10` as percentage
  - Uses the same `gold-gradient` styling as existing bars

The radar chart still shows the per-dimension breakdown visually, so no information is lost.

### File modified
- `src/components/game/ReportScreen.tsx` — swap lines 189-209

