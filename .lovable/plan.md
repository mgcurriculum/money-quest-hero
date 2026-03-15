

## Plan: Enable OTP Validation + Fix Welcome Audio

### Issue 1: OTP is bypassed everywhere

Currently the ProfileScreen has two hardcoded bypasses that skip OTP entirely:

- **Line 57**: `otpStep` initialized to `'verified'` instead of `'idle'`
- **Lines 65-69**: `useEffect` that force-sets `phoneVerified = true` on mount
- **Lines 79-88**: The `useEffect` that resets OTP when phone changes is commented out

These need to be restored so OTP actually works for both preview and production.

### Issue 2: Welcome audio not playing

The `useNarration` hook calls the `elevenlabs-tts` edge function, but the function is not listed in `supabase/config.toml` with `verify_jwt = false`. Since the welcome screen has no authenticated user, the request gets rejected with a JWT error before reaching the function code. The edge function logs show only boot/shutdown cycles with no actual request processing, confirming requests are being blocked.

### Changes

**File: `src/components/game/ProfileScreen.tsx`**

1. Change `otpStep` initial state from `'verified'` to `'idle'` (line 57)
2. Remove the `useEffect` that auto-sets `phoneVerified = true` (lines 65-69)
3. Uncomment the `useEffect` that resets OTP state when phone/country changes (lines 79-88)
4. Update `canProceedStep0` to require both name+age validation AND `otpStep === 'verified'` (already does this, just needs OTP to actually start as `'idle'`)
5. For retake flow: check if `state.phoneVerified` is already true (from a previous verification), and if so, initialize `otpStep` as `'verified'` — so returning users skip re-verification

```typescript
// Line 57: Only auto-verify on retake
const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verified'>(
  state.phoneVerified ? 'verified' : 'idle'
);

// Lines 65-69: Remove the force-verify useEffect entirely

// Lines 79-88: Uncomment the OTP reset effect
```

**File: `supabase/config.toml`**

Add the `elevenlabs-tts` function with `verify_jwt = false` so unauthenticated users can use TTS:

```toml
[functions.elevenlabs-tts]
verify_jwt = false
```

| File | Change |
|------|--------|
| `src/components/game/ProfileScreen.tsx` | Re-enable OTP flow, keep retake bypass |
| `supabase/config.toml` | Add `elevenlabs-tts` with `verify_jwt = false` |

