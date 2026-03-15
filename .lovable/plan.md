

## Plan: Add OTP Authentication to User Dashboard

Currently the `/profile` page shows session history after a simple phone number lookup with no verification. This needs to be secured with OTP verification before displaying any data.

### Changes in `src/pages/UserDashboard.tsx`

**Add OTP verification step between phone entry and data display:**

1. Add new state: `otpStep` (`'phone' | 'otp' | 'verified'`), `otp`, `otpError`, `sending`, `verifying`, `resendTimer`
2. Change the "Find My Profile" button to "Send OTP" — calls `send-otp` edge function instead of querying sessions directly
3. After OTP sent, show a 6-digit OTP input with resend/change number options (reuse the same UI pattern from `PhoneVerificationScreen`)
4. On successful OTP verification via `verify-otp` edge function, set `otpStep = 'verified'` and then fetch sessions
5. Only render profile/history/charts when `otpStep === 'verified'`
6. Logout button resets `otpStep` back to `'phone'`

**Flow:**
```text
Enter phone → Send OTP → Enter 6-digit code → Verify → Fetch & show sessions
```

| What | Detail |
|------|--------|
| Phone input | Same country picker + phone field, button changes to "Send OTP" |
| OTP input | 6-digit field with resend timer (30s) and "Change number" link |
| On verify success | Fetch sessions from DB and display dashboard |
| Logout | Reset all state including `otpStep` back to `'phone'` |

Single file change: `src/pages/UserDashboard.tsx`

