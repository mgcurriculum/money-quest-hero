

## Plan: Generate Branded PDF Report with Q&A, Tips, and Suggestions

### Overview

Build a proper PDF report that gets generated client-side using `jspdf` + `jspdf-autotable`. The same PDF content will be used for both Download and Email (attached as HTML in the email body). The PDF will match brand colors (Deep Purple #2D1B69, Sky Blue #4FC3F7), use the same layout structure, and include:

1. Header with logo + player name
2. FQ Score with band level
3. Dimension score breakdown (7 bars as a table)
4. Questions & Answers section (what they chose for each question)
5. Personalized financial tips based on weak dimensions
6. Suggestions for improvement based on archetypes

---

### Part 1: Create PDF Generator Utility

**New file: `src/utils/generateReportPDF.ts`**

A utility function that takes the full game state + calculated scores and builds an HTML string for the PDF. Uses `window.open` with a styled HTML document and triggers `window.print()` for PDF download (no extra dependency needed — keeps it simple and styled).

Actually, better approach: Generate a branded HTML report in a new window with `window.print()`. This preserves fonts, colors, gradients, and layout without needing a PDF library.

The HTML will include:
- **Page 1**: Logo, player name, FQ Score ring (static), band level/meaning
- **Page 2**: Dimension breakdown table with score bars (CSS-rendered)
- **Page 3**: Questions & Answers — for each level, list the question text and the option the player selected (highlighted)
- **Page 4**: Financial Tips — generated based on which dimensions scored below 50%, pulling from archetypes data (the `.quest` and `.risk` fields)
- **Page 5**: Suggestions — general financial awareness tips + the player's reflection goal

### Part 2: Build Q&A Data Extraction

In `ReportScreen.tsx`, extract the actual questions and selected answers from `state.answers` mapped against the question bank (`realityQuestions` for level 0, `levels[n].scenarios` for levels 1-6). Each entry will show:
- Level name + icon
- Question text
- Selected option text + emoji
- Score (1-5)

### Part 3: Financial Tips Engine

Create a `getFinancialTips` function in the PDF generator that:
- For each dimension scoring < 50%: pulls the archetype's `.low.risk` and `.low.quest` as actionable tips
- For each dimension scoring >= 50%: pulls `.high.strength` as a positive reinforcement
- Adds 3-5 general financial awareness suggestions at the end (hardcoded wisdom)

### Part 4: Update ReportScreen

- Replace `handleDownloadPDF` (currently just `window.print()`) with the new function that opens a branded print-ready HTML page
- Update `handleSendEmail` to pass the full Q&A data + tips to the edge function
- The edge function already sends HTML email — extend it with Q&A rows and tips sections

### Part 5: Update Edge Function

**Modified: `supabase/functions/send-report-email/index.ts`**

Add new body parameters: `questionsAndAnswers` (array of {level, question, selectedOption, score}), `tips` (array of strings), `suggestions` (array of strings). Render them as additional HTML sections in the email body with the same brand styling.

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/utils/generateReportPDF.ts` | Create — HTML report generator + tips engine |
| `src/components/game/ReportScreen.tsx` | Modify — wire up PDF generator, pass Q&A data to email |
| `supabase/functions/send-report-email/index.ts` | Modify — add Q&A + tips sections to email HTML |

### Brand Styling in PDF/Email

- Background: `#2D1B69` (deep purple) header, `#ffffff` body
- Accent: `#4FC3F7` (sky blue) for scores, highlights
- Secondary: `#7C4DFF` (purple accent) for gradients
- Font: System sans-serif (web-safe for email/print compatibility)
- Cards: `#f8f6ff` light purple background
- Score bars: CSS gradient from `#4FC3F7` to `#7C4DFF`

