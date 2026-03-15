

## Plan: Inline OTP Verification on Profile Screen

### What
Remove the separate `PhoneVerificationScreen` and instead add inline OTP verification directly in the profile screen's phone number field. After entering the phone number and tapping "Send OTP", a 6-digit OTP input appears below the phone field. Once verified, the phone field shows a green checkmark and the flow proceeds directly to the quiz (skipping the `phone-verify` step entirely).

### Changes

#### 1. `src/components/game/ProfileScreen.tsx`
- Add OTP state variables: `otp`, `otpStep` (`idle` | `sent` | `verified`), `sending`, `verifying`, `otpError`, `resendTimer`
- Add a "Send OTP" button next to the phone input (appears when phone has 10+ digits and OTP not yet verified)
- When OTP is sent, show a 6-digit OTP input field below the phone field with resend/timer
- On successful verification, show a green checkmark on the phone field, set `otpStep` to `verified`
- Update `canProceedStep0` to also require `otpStep === 'verified'`
- In `handleRoleSelect`, skip `phone-verify` step — go directly to `quiz` via `START_QUIZ` dispatch
- Remove the `phone-verify` step transition entirely

#### 2. `src/pages/CampaignLanding.tsx` & `src/pages/Index.tsx` (if used)
- Remove `PhoneVerificationScreen` import and `phone-verify` case from the flow (optional cleanup)

#### 3. No backend changes
- Reuses existing `send-otp` and `verify-otp` edge functions as-is

### UX Flow
```text
Phone Number: [+91] [9876543210] [Send OTP]
              ──── OTP sent! ────
Enter OTP:   [• • • • • •]  Resend in 28s
              ✓ Verified
```

