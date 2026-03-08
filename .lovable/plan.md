

# Campaign Management Feature Plan

## Overview
Add a campaign system where admins create campaigns with unique links/QR codes, track responses separately, and pick random winners via a spin wheel.

## Database Changes

### New table: `campaigns`
- `id` (uuid, PK)
- `name` (text)
- `description` (text, nullable)
- `slug` (text, unique) -- used in campaign URL
- `is_active` (boolean, default true)
- `created_by` (uuid, references auth.users)
- `created_at`, `updated_at` (timestamptz)
- `winner_session_id` (uuid, nullable, references game_sessions) -- stores spin wheel winner

### Modify `game_sessions` table
- Add `campaign_id` (uuid, nullable, references campaigns) -- links a session to a campaign

### RLS Policies
- Admins: full CRUD on campaigns
- Public: read active campaigns (needed for the campaign landing page)
- game_sessions: existing insert policy already allows anyone; the campaign_id will be included in inserts

## New Pages & Components

### 1. Admin Campaigns Page (`/admin/campaigns`)
- List all campaigns with response count, average score, status
- Create campaign form (name, description)
- Auto-generate a unique slug
- Display campaign link (`/c/{slug}`) and QR code (generated client-side using a small QR library or canvas-based approach)
- Click into a campaign for its dedicated dashboard

### 2. Campaign Dashboard (`/admin/campaigns/:id`)
- **Live stats**: total responses, average FQ score, band distribution (real-time via Supabase Realtime)
- Response count auto-updates
- Session list filtered to this campaign
- **Spin Wheel**: randomly selects a winner from campaign participants, saves result

### 3. Campaign Landing Page (`/c/:slug`)
- Public route that loads the quiz flow within campaign context
- On load, checks if slug is valid/active
- Before starting, checks if user's email or phone already has a completed session:
  - If yes: show two options -- "Join with existing evaluation" or "Retake test"
  - "Join with existing" clones/links the previous session to this campaign
  - "Retake" starts fresh quiz, tagged to this campaign
- If no prior session, starts normal quiz flow with campaign_id attached

## Route Changes (`App.tsx`)
- Add `/admin/campaigns` and `/admin/campaigns/:id` under AdminLayout
- Add `/c/:slug` as public route

## Admin Sidebar
- Add "Campaigns" nav item to AdminLayout

## Technical Details

### QR Code Generation
Use canvas-based QR generation (e.g., `qrcode` npm package or a lightweight React QR component) to render the campaign URL as a downloadable QR image.

### Realtime Dashboard
Enable realtime on `game_sessions` table, subscribe filtered by `campaign_id` to auto-update counts and scores.

### Spin Wheel
Animated wheel component using CSS/Framer Motion. Randomly selects from campaign participants, stores winner in `campaigns.winner_session_id`.

### Existing User Detection
On campaign landing page, prompt for email/phone first, then query `game_sessions` for matching records. If found, offer the two options before proceeding.

## Implementation Order
1. Database migration (campaigns table + campaign_id on game_sessions)
2. Admin campaigns list page with create/QR/link
3. Campaign landing page (`/c/:slug`) with existing-user check flow
4. Modify GameContext and ReportScreen to pass campaign_id on session save
5. Campaign dashboard with live stats and spin wheel
6. Wire up routes and sidebar navigation

