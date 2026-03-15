

## Fix PDF Report Formatting Issues

**Root cause**: The PDF utility's `normalizeDimension()` only matches full dimension names (e.g., "Financial Safety"), but the database stores short names (e.g., "Protecting"). So Q&A sections display raw short names and don't group/sort correctly.

### Changes in `src/utils/generateReportPDF.ts`

1. **Add short-to-full dimension mapping** (same as `dimensionKeyMap` in ReportScreen):
```typescript
const SHORT_TO_FULL: Record<string, string> = {
  'Earning': 'Earning Mindset',
  'Spending': 'Spending Behaviour',
  'Saving': 'Saving Behaviour',
  'Borrowing': 'Debt Awareness',
  'Investing': 'Investment Awareness',
  'Protecting': 'Financial Safety',
};
```

2. **Update `normalizeDimension()`** to first check the short-name map, then fall back to existing logic.

3. **Fix page-break splitting** — wrap each dimension section header + its questions so they don't split across pages. Add `page-break-inside: avoid` on section headers with their first question.

4. **Remove emoji from score card** (`bandEmoji`) that renders as a loading artifact in PDF — replace with text-only rendering, or keep only in the "You are" line (not as a standalone large glyph).

| What | Fix |
|------|-----|
| "Protecting" instead of "Financial Safety" | Add short→full name map to normalizeDimension |
| Questions not grouped properly | Normalization fix resolves grouping automatically |
| Page break splits header from questions | CSS `page-break-after: avoid` on section headers |
| Large emoji renders as loading icon | Remove standalone 56px emoji div from score card |

Only file changed: `src/utils/generateReportPDF.ts`

