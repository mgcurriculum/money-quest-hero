

## Plan: Disable OTP in Preview

Simple change — auto-set OTP as verified so you can skip phone verification during testing.

### File: `src/components/game/ProfileScreen.tsx`

Change the initial `otpStep` state (line 57) to always start as `'verified'`:

```typescript
const [otpStep, setOtpStep] = useState<'idle' | 'sent' | 'verified'>('verified');
```

Also auto-dispatch phone verified on mount so the rest of the flow recognizes it:

```typescript
useEffect(() => {
  if (!state.phoneVerified) {
    dispatch({ type: 'SET_PHONE_VERIFIED', verified: true });
  }
}, []);
```

The Send OTP button and OTP input won't render since `otpStep` starts as `'verified'`. The green "Verified" badge will show instead.

No other files need changes.

