

## Plan: Replace Logo with White Version

The current dark logo isn't visible against the deep purple game background. Replace it with the uploaded white logo.

### Changes

1. **Copy white logo** — Copy `user-uploads://finquo-logo-white.png` to `src/assets/finquo-logo-white.png`

2. **Update all components using the logo** — Switch imports from `finquo-logo.png` to `finquo-logo-white.png` in:
   - `WelcomeScreen.tsx`
   - `ConsentScreen.tsx`
   - `ReportScreen.tsx`

No other changes needed — just a logo file swap for visibility.

