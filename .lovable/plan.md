

## Plan: Retake Shows Pre-filled Editable Profile + Role Selection

### What Changes

**1. `src/context/GameContext.tsx`** — Change `RETAKE` action to go to `profile` instead of `quiz`, keeping all existing profile data and `phoneVerified: true`.

```typescript
case 'RETAKE': return {
  ...state,
  currentQuestion: 0,
  answers: {},
  reflectionAnswer: '',
  step: 'profile',  // go to profile, not quiz
};
```

**2. `src/components/game/ProfileScreen.tsx`** — Initialize local state from existing profile when available (retake scenario):

- `name` → `state.profile.name`
- `age` → `state.profile.age` (if > 0)
- `gender` → `state.profile.gender`
- `phone` → extract digits after country code from `state.profile.phone`
- `selectedCountry` → match from `state.profile.country`
- `otpStep` → set to `'verified'` if `state.phoneVerified` is true (skip OTP entirely)
- `campaignCode` → `state.campaignCode`

All fields remain editable. If the user changes their phone number, OTP verification resets (existing behavior). The role selection step (step 1) is always shown — user must re-select their current role.

### Summary

| File | Change |
|------|--------|
| `src/context/GameContext.tsx` | RETAKE goes to `profile` step |
| `src/components/game/ProfileScreen.tsx` | Pre-fill state from existing profile, auto-set OTP as verified if `phoneVerified` |

No database changes needed.

