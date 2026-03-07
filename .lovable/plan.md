

## Plan: Backend, Admin Dashboard, UX Improvements, and Sharing Features

This is a large set of changes. I recommend implementing in **3 phases** across multiple messages to keep things manageable and testable.

---

### Phase 1: Database + Backend Data Saving + UX Fixes

**1a. Database Tables (migrations)**

Create these tables:

- **`questions`** — stores all questions with fields: `id`, `level` (0-6), `category`, `question_text`, `options` (jsonb array), `age_groups` (text[] e.g. `['18-25','26-39','40-59','60+']`), `is_active` (boolean), `sort_order`, `created_at`, `updated_at`
- **`game_sessions`** — stores completed test results: `id`, `player_name`, `player_age`, `player_gender`, `player_phone`, `player_country`, `player_state`, `player_district`, `player_status`, `player_income_type`, `answers` (jsonb), `fq_score` (int), `primary_archetype` (text), `secondary_archetype` (text), `band_level` (text), `reflection_answer`, `created_at`
- **`admin_settings`** — key/value config: `id`, `key` (unique), `value` (jsonb). Stores things like `questions_per_level` config.

Seed the `questions` table with all current hardcoded questions from `data/questions.ts`, defaulting `age_groups` to all 4 groups.

RLS: `game_sessions` allows anonymous inserts (no auth needed for players). Admin tables require authentication with admin role.

**1b. Fix mute state persistence**

Move `isMuted` state up to `GameContext` so it persists across all screen transitions. The `useNarration` hook will accept `isMuted` as a parameter instead of managing its own state. Each screen's mute toggle will dispatch to the context.

**1c. Split Profile into two screens**

The current ProfileScreen has step 0 (name/age/gender/phone) and step 1 (status + income). Change step 1 to be two separate sub-steps:
- Step 1: "What best describes your current stage?" (full-screen, single selection)
- Step 2: "How do you usually receive money?" (full-screen, single selection)

**1d. Remove Journey Map — linear flow**

Remove the JourneyMap screen entirely. After Profile, go directly to Level 0, then auto-advance through Levels 1-6 sequentially. After completing each level, auto-start the next instead of returning to the map. After Level 6, go to Reflection.

Update `GameContext`:
- `COMPLETE_LEVEL` action: if level < 6, auto-start next level; if level === 6, go to reflection
- Remove `'journey'` from step type

**1e. Global progress bar**

Add a persistent progress bar component at the top of every screen (Welcome through Report). Calculate overall progress based on current step:
- Welcome: 0%, Consent: ~5%, Profile: ~10%, Level 0: 15-25%, Level 1-6: 25-85%, Reflection: 90%, Report: 100%

---

### Phase 2: Admin Dashboard + Question Management

**2a. Admin authentication**

- Create `user_roles` table with `app_role` enum (`admin`, `user`)
- Add login page at `/admin/login`
- Protected `/admin` routes checking admin role via `has_role()` function

**2b. Admin Dashboard pages**

- **`/admin`** — Overview: total sessions, average FQ score, score distribution chart, recent sessions table with export to CSV
- **`/admin/questions`** — View/edit all questions grouped by category (level). CRUD operations. Toggle `is_active`. Set `age_groups` per question.
- **`/admin/settings`** — Configure total questions per level, select which questions are active per age group

**2c. Question management features**

- Admin can set how many questions appear per category (e.g., 3 out of 5 available questions for Level 1)
- Admin can tag questions with age groups; the game filters questions based on player's age from profile
- The game reads questions from the database instead of hardcoded data, filtered by age group and limited by admin-configured count

**2d. Data export**

- Admin can export all session data as CSV from the dashboard
- Filter by date range, age group, score band

---

### Phase 3: Report Enhancements (PDF, Email, Social Sharing)

**3a. PDF download**

Use browser's `window.print()` with a print-optimized layout, or generate a canvas-based PDF using html2canvas + jsPDF. The report screen will have a "Download PDF" button.

**3b. Email report**

Add a modal where users enter their email. Create an edge function that sends the report via email (using Lovable's transactional email capability or a third-party service).

**3c. Social sharing (WhatsApp, Instagram, Facebook)**

- **WhatsApp**: Already exists; keep `wa.me` link
- **Facebook**: Add `https://www.facebook.com/sharer/sharer.php?u=...` share link
- **Instagram**: Instagram doesn't support URL-based sharing; add a "Copy to clipboard" option with a note to paste on Instagram Stories
- Replace current Twitter/LinkedIn buttons with WhatsApp, Facebook, Instagram

---

### Save data to backend**

After the report is generated, automatically save the full session (profile + answers + scores) to the `game_sessions` table. No authentication required for players.

---

### Files to Create/Modify

**New files:**
- `src/pages/admin/Login.tsx`
- `src/pages/admin/Dashboard.tsx`
- `src/pages/admin/Questions.tsx`
- `src/pages/admin/Settings.tsx`
- `src/components/game/GlobalProgressBar.tsx`
- `src/hooks/useQuestions.ts` (fetch questions from DB)

**Modified files:**
- `src/context/GameContext.tsx` — add mute state, remove journey step, add auto-advance logic
- `src/hooks/useNarration.ts` — accept external mute state
- `src/components/game/ProfileScreen.tsx` — split into 3 sub-steps
- `src/components/game/ReportScreen.tsx` — add PDF download, email, FB/Instagram share, save to backend
- `src/pages/Index.tsx` — remove journey case, add progress bar wrapper
- `src/App.tsx` — add admin routes
- `src/data/questions.ts` — keep as fallback, but game will fetch from DB

**Database migrations:** 3-4 migration files for tables, RLS, seeding

---

### Recommended Implementation Order

Given the scope, I recommend starting with **Phase 1** (backend setup, mute fix, profile split, remove journey map, progress bar), then Phase 2 (admin), then Phase 3 (PDF/email/sharing). Each phase will be a separate implementation message.

Shall I proceed with Phase 1?

