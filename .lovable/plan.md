

## Plan: Clean Up Report Screen + Add PDF Download & Email

### Changes to `src/components/game/ReportScreen.tsx`

**Remove these sections:**
1. **Primary/Secondary Archetype cards** (lines 127-141) — the two-column grid with "Primary" and "Secondary" labels
2. **Improvement Quest section** (lines 192-197) — the "🎯 Your Improvement Quest" / "Mission" / "🏅 Complete this" block
3. **Dimension score bar sub-labels** showing archetype names like "🧾 Avoid unnecessary debt" (line 171 — remove the `profile.emoji + profile.name` line from each dimension bar)

**Add two new action buttons before "Take Test Again":**

1. **📥 Download PDF** — Uses browser's `window.print()` with a print-friendly CSS approach, or generates a client-side PDF using the existing DOM. Since adding a heavy library like html2canvas+jspdf would be complex, we'll use `window.print()` with `@media print` styles for a clean printable report.

2. **📧 Send to Email** — Shows a modal/dialog collecting the user's email address, then calls a new backend function to save the email + session data. We'll create a simple edge function that stores the email request and uses Lovable AI to generate and send a summary email.

Actually, for PDF: `window.print()` is simplest and works well on mobile. For email: we need to collect the email, store it, and send the report.

### Email collection approach
- Add a dialog with email input field
- Save email to a new `report_emails` table (or just add `player_email` column to `game_sessions`)
- For sending: create an edge function that formats the report data and sends via Lovable's transactional email capability

### Database change
Add `player_email` column to `game_sessions` table (nullable text) — simpler than a new table.

### New edge function: `send-report-email`
- Receives: player name, fq score, band level, dimension scores, email
- Sends a formatted HTML email with the report summary

### Files to modify
- `src/components/game/ReportScreen.tsx` — remove 3 sections, add PDF download + email dialog
- `src/context/GameContext.tsx` — add `email` to PlayerProfile (optional)
- Database migration — add `player_email` to `game_sessions`
- New edge function `supabase/functions/send-report-email/index.ts`

