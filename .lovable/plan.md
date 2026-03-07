

## Plan: Replace Fredoka with Rethink Sans for Display Font

**Problem:** The current display font (Fredoka) looks childish for a financial assessment tool.

**Solution:** Replace Fredoka with the uploaded Rethink Sans font for all headings/titles (h1-h6 and `.font-display` usage).

### Steps

1. **Extract and copy font files** from the uploaded `Rethink_Sans.zip` to `public/fonts/` directory (woff2/ttf files for weights 400-700+).

2. **Update `src/index.css`:**
   - Remove Fredoka from the Google Fonts import (keep Inter)
   - Add `@font-face` declarations for Rethink Sans with the relevant weights (400, 500, 600, 700)
   - Update `--font-display` CSS variable from `'Fredoka'` to `'Rethink Sans'`

3. **No other files need changes** — the entire app already uses `var(--font-display)` for headings and `font-display` Tailwind class, so swapping the variable propagates everywhere.

### Files modified
- `public/fonts/` — new font files
- `src/index.css` — font-face declarations + variable update

