
Goal: Fix PDF report formatting issues (question IDs, extra “loading-like” icon, and alignment).

What I found from your uploaded PDF:
- Q IDs appear in mixed/random order inside sections (e.g., Q10, Q12, Q11), which looks unformatted.
- A stray glyph appears before “YOUR REFLECTION” (looks like a loading icon) due to emoji/font fallback in PDF rendering.
- Some rows/cards have inconsistent alignment when text wraps (especially question + score layouts).

Implementation plan

1) Normalize and order Q&A data before rendering
- File: `src/utils/generateReportPDF.ts`
- In `extractQuestionsAndAnswers()` / `generateReportHTML()`:
  - Normalize dimension labels to one canonical set (Earning Mindset, Spending Behaviour, etc.).
  - Sort sections by fixed business order (same as report dimensions).
  - Sort questions within each section by numeric `questionNo`.
  - Add safe fallback for missing IDs (`Q--`) so layout never breaks.

2) Make question ID formatting consistent and readable
- File: `src/utils/generateReportPDF.ts`
- Replace plain `Q${qa.questionNo}.` text with a fixed-width ID badge/chip (e.g., `Q01`, `Q10`), so all cards align even with mixed digit lengths.
- Keep ID and question text on stable columns using a small two-column structure (ID + content).

3) Remove emoji/glyphs that render as “loading icon” in PDF
- File: `src/utils/generateReportPDF.ts`
- Replace section-heading emojis (especially reflection icon) with text-only headings or ASCII-safe symbols.
- Keep branding clean while avoiding emoji font fallback artifacts in `html2pdf`.

4) Fix alignment robustness for long text
- File: `src/utils/generateReportPDF.ts`
- Rework Q&A row layout to prevent score pills from drifting when question/answer text wraps.
- Apply explicit widths, `vertical-align: top`, and controlled `line-height`.
- Ensure dimension table columns have stable widths so percentages and bars line up consistently.

5) Tune PDF rendering/page-break behavior
- File: `src/utils/generateReportPDF.ts`
- Replace broad `pagebreak.avoid: ['div']` with targeted avoid rules (only rows/cards that must stay together).
- Keep A4 width strict and adjust capture timing slightly to ensure final render is fully settled.

Technical details (implementation-focused)
- Add a local canonical dimension order map and comparator for sorting.
- Sanitize values before interpolation (`questionNo`, `selectedOption`, `question`) to avoid malformed display.
- Use semantic wrapper classes in HTML (`qa-card`, `tip-card`, `section-title`) and bind page-break rules to those classes.
- Keep all changes isolated to PDF utility so both current report download and history report download improve together automatically.

Validation checklist
- Download a fresh report and one from “Past Attempts”.
- Confirm:
  - IDs are ordered and consistently formatted.
  - No extra loading-like icon appears.
  - Q/A and score pills are aligned on long and short text.
  - Page breaks do not split cards awkwardly.
