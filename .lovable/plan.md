

## Plan: Fix Next Button Not Working

**Root Cause**: Phone input is disabled when `otpStep === 'verified'`, but phone validation (`isPhoneValid`) is still required to proceed. Since OTP is auto-verified for preview with an empty phone, the Next button stays disabled.

### Fix in `src/components/game/ProfileScreen.tsx`

Two changes:

1. **Don't disable the phone input** when OTP is auto-verified for preview — remove the `disabled` prop so users can type their phone number freely.

2. **Make phone validation optional** for preview — update `canProceedStep0` to not require `isPhoneValid` when OTP is already verified (preview mode):

```typescript
// Line 94: relax validation — phone optional in preview
const canProceedStep0 = name.trim().length > 0 && isValidAge && otpStep === 'verified';
```

```typescript
// Line 304: remove disabled prop so phone is always editable
disabled={false}  // was: disabled={otpStep === 'verified'}
```

| File | Change |
|------|--------|
| `src/components/game/ProfileScreen.tsx` | Remove phone validation from `canProceedStep0`, remove disabled on phone input |

