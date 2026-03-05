

## Plan: Rename "Money" to "Finance/Financial" + Update Favicon + Remove Lovable Branding

### 1. Rename "Money" to "Finance/Financial" in UI Text

| File | Current | New |
|------|---------|-----|
| `WelcomeScreen.tsx` | "Your Money Journey Starts Here" | "Your Financial Journey Starts Here" |
| `ProfileScreen.tsx` | "Create Your Money Profile" | "Create Your Financial Profile" |
| `ReportScreen.tsx` | "Money Journey Results" | "Financial Journey Results" |
| `ReportScreen.tsx` | "Money Superpower" | "Financial Superpower" |
| `ReflectionScreen.tsx` | "money skill" (x2) | "financial skill" |
| `JourneyMap.tsx` | "money skill" in narration | "financial skill" |
| `ReflectionScreen.tsx` | "better with money" in narration | "better with finances" |
| `index.html` | "Money Quest" in title/meta | "Finance Quest" |
| `ProfileScreen.tsx` narration | "money profile" references | "financial profile" |

Note: Questions in `data/questions.ts` that use "money" in actual scenario text (e.g., "How much money do you receive") will stay as-is since those are natural language questions, not branding.

### 2. Update Favicon to FinQuo Logo
- Copy uploaded logo `user-uploads://finquo-logo-2.png` to `public/favicon.png`
- The `index.html` already references `/favicon.png`, so no HTML change needed

### 3. Remove Lovable Branding
- Remove `lovable-tagger` from `vite.config.ts` (the `componentTagger` plugin)
- The "Edit in Lovable" badge can also be hidden via project Settings, but removing the tagger plugin from the build removes it from code

### Files to Change
- `src/components/game/WelcomeScreen.tsx`
- `src/components/game/ProfileScreen.tsx`
- `src/components/game/ReportScreen.tsx`
- `src/components/game/ReflectionScreen.tsx`
- `src/components/game/JourneyMap.tsx`
- `index.html`
- `vite.config.ts`
- Copy `user-uploads://finquo-logo-2.png` to `public/favicon.png`

