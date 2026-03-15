

## Plan: Proper PDF Report for Download & Email

### Problem
Both the download and email report are basic HTML views with poor alignment. Need a professionally designed, well-structured PDF for download, and the same quality HTML for email.

### Approach

**1. Redesign `generateReportHTML()` in `src/utils/generateReportPDF.ts`**

Overhaul the HTML template used for PDF generation with:
- Proper A4-optimized layout with consistent spacing
- Clean header with gradient background, logo, player name, profile label
- Score section with large score display, band level, and meaning
- Dimension breakdown as a properly aligned table with progress bars
- Q&A section grouped by dimension with clean card-style layout
- Financial tips section with styled cards
- Reflection answer section
- Footer with branding
- Better page-break handling between sections for multi-page PDFs
- All inline styles optimized for html2pdf.js rendering (no CSS classes)

**2. Update `downloadReportAsFile()` in `src/utils/generateReportPDF.ts`**

Fine-tune html2pdf.js settings:
- Better margins for A4 readability
- Improved page break configuration
- Higher quality rendering

**3. Update `send-report-email` edge function**

Rebuild the email HTML body to match the same professional design as the PDF report. Use the same structure: header → score → dimensions table → Q&A → tips → footer. The edge function already receives all the data needed (`dimensionScores`, `questionsAndAnswers`, `tips`). Align the field names between frontend and edge function (currently mismatched: frontend sends `label`/`icon`/`score` but email template reads `d.label`/`d.icon`/`d.score`).

Also pass `maxScore` and `profileLabel` from frontend to get proper display.

### Files Changed

| File | Change |
|------|--------|
| `src/utils/generateReportPDF.ts` | Redesign HTML template + tune pdf settings |
| `src/components/game/ReportScreen.tsx` | Pass `profileLabel` to email invoke |
| `supabase/functions/send-report-email/index.ts` | Rebuild email HTML to match PDF design |

No database changes needed.

