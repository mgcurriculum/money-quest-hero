

## Plan: Add Logout to Profile Screen + Fix Welcome Audio on First Load

### Issue 1: No logout option on Profile/Dashboard screen
The `UserDashboard.tsx` page has no logout or session-clearing mechanism.

**Fix:** Add a "Logout" button in the header area of `src/pages/UserDashboard.tsx`. Since this page uses phone-based lookup (not Supabase auth), "logout" means clearing the searched sessions and navigating back to home. Add a visible logout/clear button that resets state and navigates to `/`.

### Issue 2: Welcome audio only plays when navigating back, not on first load
The browser blocks `audio.play()` on first page load because there's been no user interaction (autoplay policy). When navigating back from another screen, the user has already clicked, so autoplay is allowed.

**Fix in `src/components/game/WelcomeScreen.tsx`:**
- Remove auto-narration on mount entirely (it can't work reliably due to browser autoplay restrictions)
- Instead, make the mute button double as a "play narration" trigger — when user unmutes or clicks a "Listen" button, play the welcome narration
- OR: attempt autoplay, and if it fails with `NotAllowedError`, show a small "Tap to hear welcome message" prompt that plays on click

**Recommended approach:** Try autoplay on mount (current behavior), but when it fails, show a small "🔊 Tap to listen" button. This way it works on back-navigation automatically and gracefully handles first-load restrictions.

### Changes

| File | Change |
|------|--------|
| `src/pages/UserDashboard.tsx` | Add logout/clear button in header that clears sessions and navigates to `/` |
| `src/components/game/WelcomeScreen.tsx` | Handle autoplay failure: show "Tap to listen" fallback button when browser blocks audio |
| `src/hooks/useNarration.ts` | Return autoplay-blocked state so WelcomeScreen can show fallback UI |

### Implementation details

1. **UserDashboard logout:** Add a `LogOut` icon button next to the back arrow. On click, clear `sessions`, `searched`, `phone` state and navigate to `/`.

2. **Welcome audio fix:**
   - In `useNarration.ts`: add `autoplayBlocked` state, set it to `true` when `audio.play()` throws `NotAllowedError`, return it from the hook
   - In `WelcomeScreen.tsx`: watch `autoplayBlocked` — if true, render a small floating "🔊 Tap to listen" button that calls `speak(WELCOME_TEXT)` on user click (which satisfies browser interaction requirement)
   - Reset `hasNarrated` ref logic so re-attempting after user tap works correctly

