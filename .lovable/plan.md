

## Plan: Reorder Countries in Country Code Picker

### What
Reorder the `COUNTRIES` array in `src/components/game/CountryCodePicker.tsx` so the first 4 entries are India, UAE, USA, UK (in that order), followed by all remaining countries alphabetically.

### Change
**File: `src/components/game/CountryCodePicker.tsx`**
- Move India (`IN`), UAE (`AE`), USA (`US`), UK (`GB`) to the top of the `COUNTRIES` array in that exact order
- Sort the remaining countries alphabetically by name

Single file edit, no backend changes needed.

