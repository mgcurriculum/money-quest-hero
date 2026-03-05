

## Plan: Rebrand UI to FinQuo Versity Colors + Add Logo

### Brand Colors (extracted from logo)
- **Deep Purple**: `#2D1B69` (primary dark)
- **Medium Purple**: `#6B4FA0` (surfaces, cards)
- **Sky Blue / Cyan**: `#4FC3F7` (accent, highlights, CTAs)
- **Light Lavender**: `#E8E0F0` (light backgrounds, muted)

These replace the current gold/orange theme throughout.

### Changes

**1. Copy logo into project**
- Copy `user-uploads://finquo-logo.png` to `src/assets/finquo-logo.png`

**2. Update CSS variables (`src/index.css`)**
- Replace `--game-gold` and `--game-orange` with cyan/blue tones
- Replace `--game-bg`, `--game-surface`, `--game-card` with purple-based dark tones
- Update `--primary` to use the brand purple
- Update `--accent` to the cyan blue
- Replace `.gold-gradient` with a purple-to-cyan gradient
- Replace `.gold-text` similarly
- Update `.pulse-glow` to use cyan glow

**3. Update Tailwind config (`tailwind.config.ts`)**
- No structural changes needed since it references CSS variables; the variable updates will cascade.

**4. Update all 7 game screens to use logo image + new brand palette**

- **WelcomeScreen**: Replace the trophy emoji with the actual `<img>` logo. Change `gold-gradient` button to new brand gradient. Update text colors from `game-gold` to the new accent.
- **ConsentScreen**: Update checkbox highlight color from `game-green` to cyan. Brand header with logo.
- **ProfileScreen**: Update selected-state borders from `game-gold` to cyan. Update CTA button gradient.
- **JourneyMap**: Update progress bar gradient, level card borders, and accent colors from gold to cyan/purple.
- **LevelPlay**: Update floating decorations, progress dots, feedback popup, XP display, option hover/selected states — all from gold to cyan.
- **ReflectionScreen**: Update hover states and option styling.
- **ReportScreen**: Update FQ score ring gradient, radar chart stroke, dimension bars, archetype card borders, share buttons, and "Play Again" button — all to purple/cyan palette. Replace brand text with logo image.

**5. Update `index.html`**
- Update theme-color meta tag to the brand purple.

### Summary
Every gold/orange accent becomes cyan-blue. Every dark surface shifts to deep purple. The FinQuo Versity logo replaces emoji placeholders. The overall feel becomes a cohesive purple-and-blue branded experience.

