

# Add 5-Digit Campaign Code to Profile Screen

## Overview
Add a `campaign_code` column to campaigns, display it in admin, and add an optional campaign code input on the Profile screen (step 0). When users arrive via QR/campaign link (`/c/:slug`), the code auto-fills.

## Changes

### 1. Database Migration
Add a `campaign_code` text column (5-char, unique) to the `campaigns` table. Auto-generate codes for existing campaigns using a random 5-digit alphanumeric string. Generate codes automatically on insert via a trigger.

```sql
ALTER TABLE campaigns ADD COLUMN campaign_code text UNIQUE;
-- Backfill existing campaigns
UPDATE campaigns SET campaign_code = upper(substr(md5(random()::text), 1, 5));
ALTER TABLE campaigns ALTER COLUMN campaign_code SET NOT NULL;
-- Trigger to auto-generate on insert
```

### 2. Update `src/pages/admin/Campaigns.tsx`
- Show the `campaign_code` in each campaign card (e.g., "Code: AB12C")
- Auto-generate code on create (or let the DB trigger handle it)

### 3. Update `src/context/GameContext.tsx`
- Add `campaignCode: string | null` to `GameState`
- Add `SET_CAMPAIGN_CODE` action to store the code (used for auto-fill from QR flow)

### 4. Update `src/pages/CampaignLanding.tsx`
- Fetch `campaign_code` along with other campaign fields
- Dispatch `SET_CAMPAIGN_CODE` in `CampaignInit` so ProfileScreen can read it

### 5. Update `src/components/game/ProfileScreen.tsx`
- Add an optional "Campaign Code" input field on step 0 (below phone)
- Pre-fill from `state.campaignCode` if available (QR flow)
- On "Next", if a code is entered, look up the campaign by code and dispatch `SET_CAMPAIGN` with the campaign ID
- If code is invalid, show inline error; if empty, proceed without campaign

### 6. Update `src/pages/Index.tsx`
- No changes needed; ProfileScreen reads from GameContext which defaults `campaignCode` to null

## Flow
- **QR path**: User scans QR → `/c/:slug` → CampaignLanding fetches campaign → sets `campaignId` AND `campaignCode` in context → ProfileScreen shows code pre-filled (read-only or editable)
- **Direct path**: User goes to `/` → ProfileScreen shows empty optional campaign code field → user can type a 5-digit code → validated on "Next"

