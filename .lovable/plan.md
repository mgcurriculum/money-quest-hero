

## Plan: Remove "Your 2025 FQ Test Goal" Label

Remove the "Your 2025 FQ Test Goal" heading text from three locations while keeping the reflection answer content visible.

### Changes

**1. `src/components/game/ReportScreen.tsx` (line 232)**
- Remove the label line `Your 2025 FQ Test Goal`, keep showing `state.reflectionAnswer`

**2. `src/utils/generateReportPDF.ts` (line 207)**
- Remove the `Your 2025 FQ Test Goal` label from the PDF HTML

**3. `supabase/functions/send-report-email/index.ts` (line 115)**
- Remove the `Your 2025 FQ Test Goal` label from the email HTML

In all three places, the reflection answer text itself will still be displayed — only the "Your 2025 FQ Test Goal" heading is removed.

