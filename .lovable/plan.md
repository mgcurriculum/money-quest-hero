

## Plan: Add OTP Phone Verification to Campaign Flow

### Problem
The `CampaignGameFlow` in `src/pages/CampaignLanding.tsx` doesn't handle the `phone-verify` step. After profile submission, it falls through to the default `WelcomeScreen` instead of showing the OTP verification screen.

### Fix
**File: `src/pages/CampaignLanding.tsx`**
- Import `PhoneVerificationScreen`
- Add `case 'phone-verify': return <PhoneVerificationScreen />;` to the switch statement in `CampaignGameFlow`

This is a one-line fix plus one import. The existing `PhoneVerificationScreen` component and edge functions (`send-otp`, `verify-otp`) already handle everything — they just weren't wired into the campaign flow.

