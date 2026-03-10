# FQ Test – Finance Quest by FinQuo Versity

## 1. Overview

**FQ Test** (Finance Quest) is a gamified Financial Quotient assessment tool built by **FinQuo Versity**. Players navigate through 7 themed levels — starting with a Financial Reality Check followed by 6 real-life financial scenario levels — to discover their financial strengths and areas for growth. The result is a personalized FQ Test Score (0–1000) with dimension-level breakdowns and actionable quests.

**Live URL:** https://money-quest-hero.lovable.app

---

## 2. Game Flow

```
Welcome → Consent → Profile → Level 0 → Level 1 → … → Level 6 → Reflection → Report
```

| Step | Screen | Description |
|------|--------|-------------|
| 1 | **Welcome** | Introduction to the FQ Test and language selection (English / Malayalam) |
| 2 | **Consent** | Data privacy consent before proceeding |
| 3 | **Profile** | Player fills in demographic details (Step 1: personal info; Step 2: status & income type). Optional campaign code entry. |
| 4–10 | **Level Play** | Auto-advances through Level 0–6 sequentially. Level 0: 4 reality-check questions; Levels 1–6: 2 scenario-based questions each (**16 total**) |
| 11 | **Reflection** | Financial mindset question + financial goal selection |
| 12 | **Report** | FQ Test Score, dimension radar chart, per-dimension breakdown, archetypes, quests, and email report option |

> **Note:** There is no Journey Map screen — levels auto-advance sequentially after completion.

---

## 3. Question Design (16 Questions × 4 Age Groups = 64 Total)

### Distribution

| Level | Title | Questions | Dimension |
|-------|-------|-----------|-----------|
| 0 | 📋 Financial Reality Check | 4 | Financial Reality |
| 1 | 💼 The Earning Quest | 2 | Earning Mindset |
| 2 | 💳 Spending Challenge | 2 | Spending Discipline |
| 3 | 💰 Saving Mission | 2 | Saving Behaviour |
| 4 | 🧾 Debt Trap | 2 | Debt Awareness |
| 5 | 📈 Investment World | 2 | Investment Awareness |
| 6 | 🛡️ Protection Shield | 2 | Financial Safety |
| **Total** | | **16** | **7 dimensions** |

### Age-Appropriate Variations

Each of the 16 questions has **4 age-group versions**:
- **18-25**: Gen-Z tone, pop-culture references, lower currency amounts
- **26-39**: Career/family context, moderate currency amounts
- **40-59**: Mid-life/retirement context, higher currency amounts
- **60+**: Simple respectful language, pension/health focus

### Question Source Priority

Questions are loaded **database-first** via `useQuestions` hook, filtered by the player's age group. Fallback questions from `src/data/questions.ts` are used only if the database returns no results.

### Question Fields (Database)

| Field | Description |
|-------|-------------|
| `question_text` | The question prompt |
| `options` | JSON array of `{ text, emoji }` with 5 options scored 1–5 |
| `level` | 0–6 |
| `dimension` | One of the 7 dimension labels |
| `category` | Descriptive category (e.g. "Real Income Level") |
| `age_groups` | Array of applicable age groups |
| `sort_order` | Display order within the level |
| `difficulty` | 1–3 difficulty rating |
| `branch_low/mid/high` | Adaptive branching targets (optional) |
| `is_active` | Whether the question is currently in use |

---

## 4. Scoring

### Per-Question: 5 options scored 1–5 (low → high financial awareness)

### Per-Level Normalized Score (0–100):
```
normalizedScore = ((userScore - minScore) / (maxScore - minScore)) × 100
```

### Dimension Weights (configurable via Admin Settings)

| Dimension | Default Weight |
|-----------|---------------|
| 📋 Financial Reality | 0.10 |
| 💼 Earning Mindset | 0.13 |
| 💳 Spending Discipline | 0.17 |
| 💰 Saving Behaviour | 0.17 |
| 🧾 Debt Awareness | 0.14 |
| 📈 Investment Awareness | 0.14 |
| 🛡️ Financial Safety | 0.15 |

### FQ Test Score = (Σ normalizedScore[i] × weight[i]) × 10 → Range: 0–1000

Weights and score bands are **dynamically configurable** via the `admin_settings` table (keys: `dimension_weights`, `score_bands`). The `useScoringConfig` hook loads these at runtime with fallback to defaults.

---

## 5. Score Bands (configurable via Admin Settings)

| Score | Level | Emoji |
|-------|-------|-------|
| 0–199 | Financial Beginner | 🌱 |
| 200–399 | Financial Explorer | 🧭 |
| 400–599 | Developing Money Skills | 📚 |
| 600–799 | Financially Smart | 🧠 |
| 800–899 | Wealth Builder | 🏗️ |
| 900–1000 | Financial Master | 👑 |

---

## 6. Personality Archetypes (14 total — 2 per dimension)

Each dimension has a **High (≥50%)** and **Low (<50%)** archetype with traits, strengths/risks, and suggested quests. These are defined in `src/data/questions.ts` and displayed on the Report screen.

---

## 7. Campaign System

### Overview

Campaigns allow admins to create event-specific assessment links for tracking responses from specific groups (workshops, colleges, events).

### Campaign Features

| Feature | Description |
|---------|-------------|
| **Unique Slug** | Each campaign gets a URL: `/c/:slug` |
| **Campaign Code** | 5-digit alphanumeric code for manual/offline sharing |
| **QR Code** | Auto-generated QR pointing to the campaign landing page |
| **Landing Page** | `/c/:slug` — shows campaign info, allows joining or retaking the test |
| **Returning Players** | Players with existing sessions (matched by email/phone) can join a campaign without retaking |
| **Spin Wheel** | Interactive winner selection from campaign participants |
| **Real-time Dashboard** | Live participant count, score distribution, question-level answer insights |

### Campaign Flow

1. Admin creates campaign → gets slug, code, QR
2. Players access via `/c/:slug` or enter campaign code on Profile screen
3. Player completes the test → session linked to `campaign_id`
4. Admin views real-time dashboard at `/admin/campaigns/:id`
5. Admin can spin the wheel to pick a random winner

---

## 8. Admin Panel

### Access

- **Login:** `/admin/login` — email/password authentication
- **First Admin:** Created via the `create-admin` backend function (only works if no admin exists)
- **Authorization:** Role-based via `user_roles` table with `has_role()` database function

### Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Overview stats: total sessions, average scores, score distribution charts, recent sessions |
| `/admin/questions` | Questions | CRUD for all 64 questions; CSV import/export; filter by level, age group |
| `/admin/campaigns` | Campaigns | Create/manage campaigns; view campaign codes and QR codes |
| `/admin/campaigns/:id` | Campaign Dashboard | Real-time participant tracking, score stats, question insights, spin wheel |
| `/admin/settings` | Settings | Configure dimension weights, score bands, profile options |

### Layout

Sidebar navigation with Finance Quest branding, nav links, user email display, and sign-out button (`AdminLayout.tsx`).

---

## 9. Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `game_sessions` | Player assessment results — name, demographics, answers (JSON), FQ score, band, archetypes, campaign link |
| `questions` | Question bank — 64 questions with age-group variants, options, dimensions, branching |
| `campaigns` | Campaign definitions — name, slug, code, active status, winner |
| `admin_settings` | Key-value config — dimension weights, score bands |
| `profile_options` | Dynamic profile field options — status types, income types filtered by age group |
| `user_roles` | Admin authorization — maps user IDs to roles (`admin`, `user`) |

### Key Relationships

- `game_sessions.campaign_id` → `campaigns.id`
- `campaigns.winner_session_id` → `game_sessions.id`

### RLS Policies Summary

| Table | Public Read | Public Insert | Admin Full Access |
|-------|------------|---------------|-------------------|
| `game_sessions` | ✗ | ✓ | ✓ |
| `questions` | ✓ | ✗ | ✓ |
| `campaigns` | ✓ (active only) | ✗ | ✓ |
| `admin_settings` | ✓ | ✗ | ✓ |
| `profile_options` | ✓ | ✗ | ✓ |
| `user_roles` | ✗ | ✗ | ✓ |

---

## 10. Backend Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `create-admin` | Creates the first admin user (email + password) and assigns `admin` role. Blocked if an admin already exists. | No JWT required |
| `elevenlabs-tts` | Text-to-speech narration via ElevenLabs API. Used for question narration. Requires `ELEVENLABS_API_KEY` secret. | JWT required |
| `send-report-email` | Sends the FQ Test report to the player's email via AWS SES. Requires AWS credentials as secrets. | No JWT required |

---

## 11. Technical Architecture

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| State | React Context + useReducer (`GameContext`) |
| Routing | React Router v6 |
| Data Fetching | TanStack React Query |
| Charts | Recharts (radar chart, bar charts) |
| Backend | Lovable Cloud |
| Build | Vite |

### Key Files

| File | Purpose |
|------|---------|
| `src/context/GameContext.tsx` | Global game state (step, profile, answers, campaign, language, mute) |
| `src/data/questions.ts` | Fallback questions, scoring logic, archetypes, bands, dimension config |
| `src/hooks/useQuestions.ts` | DB-first question loading with age-group filtering |
| `src/hooks/useScoringConfig.ts` | Dynamic scoring weights & bands from admin settings |
| `src/hooks/useAdmin.ts` | Admin authentication & role checking |
| `src/hooks/useNarration.ts` | TTS narration via ElevenLabs backend function |
| `src/pages/Index.tsx` | Main game page — renders current step screen |
| `src/pages/CampaignLanding.tsx` | Campaign entry point (`/c/:slug`) |
| `src/components/game/*.tsx` | Game screen components (Welcome, Consent, Profile, LevelPlay, etc.) |
| `src/components/admin/*.tsx` | Admin panel components (Dashboard, SpinWheel, QuestionInsights, etc.) |
| `src/utils/generateReportPDF.ts` | Report HTML generation for print/email |
| `src/utils/dashboardAnalytics.ts` | Dashboard analytics calculations |
| `src/utils/questionsCsv.ts` | CSV import/export for questions |

### State Shape (`GameState`)

```typescript
{
  step: 'welcome' | 'consent' | 'profile' | 'level' | 'reflection' | 'report';
  profile: PlayerProfile;      // name, age, gender, phone, country, state, district, status, incomeType
  consentGiven: boolean;
  currentLevel: number;         // 0–6
  currentQuestion: number;      // question index within current level
  answers: { [level: number]: { [questionIndex: number]: number } };  // score 1–5
  completedLevels: number[];
  reflectionAnswer: string;
  language: 'en' | 'ml';
  isMuted: boolean;
  campaignId: string | null;
  campaignCode: string | null;
}
```

---

## 12. Player Profile Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | Player's full name |
| `age` | string | ✓ | Age group: 18-25, 26-39, 40-59, 60+ |
| `gender` | string | ✓ | Male, Female, Other |
| `phone` | string | ✓ | Mobile number |
| `country` | string | ✓ | Default: India |
| `state` | string | ✓ | State/province |
| `district` | string | ✓ | District/city |
| `status` | string | ✓ | Loaded from `profile_options` (e.g. Student, Employed) |
| `incomeType` | string | ✓ | Loaded from `profile_options`, filtered by age group |
| `campaignCode` | string | ✗ | Optional 5-digit code; auto-filled from campaign URL |

---

## 13. Report Screen Features

- **FQ Score** with animated counter and band level badge
- **Radar Chart** showing 7-dimension breakdown
- **Per-Dimension Cards** with normalized scores, archetypes, and quests
- **Email Report** — sends formatted HTML report via backend function
- **Print/Download** — opens printable report in new window
- **Retake** — resets game state and starts over

---

## 14. Additional Features

| Feature | Description |
|---------|-------------|
| **Language Support** | English and Malayalam (UI labels) |
| **TTS Narration** | AI voice narration of questions via ElevenLabs (toggleable mute) |
| **Responsive Design** | Mobile-first, works on all screen sizes |
| **Real-time Updates** | Campaign dashboard receives new sessions via database real-time subscriptions |
| **Session Detail Modal** | Admin can click any session to see full answer breakdown |
| **Financial Expert View** | Dedicated expert analysis component in admin |
| **QR Code Generation** | Auto-generated for campaign sharing (`qrcode.react`) |
