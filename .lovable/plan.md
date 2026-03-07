

## Plan: Remove Archetypes from Report

Remove all Primary and Secondary Financial Hero archetype references from the report screen, PDF generator, email edge function, and share text.

### Changes

**1. `src/components/game/ReportScreen.tsx`**
- Remove `primaryArchetype` and `secondaryArchetype` from the `calculateFQScore` destructure
- Remove archetype fields from the database save (`primary_archetype`, `secondary_archetype`)
- Remove archetype params from `generateReportHTML` call
- Remove archetype params from `handleSendEmail` payload
- Update `shareText` to remove the "I am a [archetype]" line

**2. `src/utils/generateReportPDF.ts`**
- Remove `primaryArchetype` and `secondaryArchetype` from `generateReportHTML` params
- Remove the "Archetypes" two-column section from the HTML output

**3. `supabase/functions/send-report-email/index.ts`**
- Remove `primaryArchetype` and `secondaryArchetype` from request body parsing
- Remove the archetype HTML section from the email template

