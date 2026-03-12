

### Bug: A4_SELF Missing from Edge Function Fallback List

**Root cause:** In `supabase/functions/import-google-sheet/index.ts` (~line 148), when HTML-based sheet discovery fails, the function uses a hardcoded fallback list of profile codes. This list is missing `A4_SELF`:

```
Current: 'A4_SAL', 'A4_HOM', 'A4_BUS', 'A4_RET'
Should be: 'A4_SAL', 'A4_HOM', 'A4_BUS', 'A4_SELF', 'A4_RET'
```

The edge function logs confirm this — the "Sheets to fetch" list shows 19 entries but `A4_SELF` is absent.

**Fix:** Update the hardcoded fallback array in `supabase/functions/import-google-sheet/index.ts` to include `A4_SELF`, making the complete list match all 19 profile codes from `data/questions.ts`.

Also add `A3_STU` if it's currently missing (the A3 group in `data/questions.ts` doesn't have STU, but the logs show it was fetched — this is harmless but worth aligning).

**File:** `supabase/functions/import-google-sheet/index.ts` — update the fallback array (~line 148) to:
```
'A1_SAL', 'A1_STU', 'A1_HOM', 'A1_BUS', 'A1_SELF',
'A2_SAL', 'A2_STU', 'A2_HOM', 'A2_BUS', 'A2_SELF',
'A3_SAL', 'A3_HOM', 'A3_BUS', 'A3_SELF',
'A4_SAL', 'A4_HOM', 'A4_BUS', 'A4_SELF', 'A4_RET',
```

Single-line fix, no other changes needed.

