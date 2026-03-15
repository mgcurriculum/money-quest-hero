

## Plan: Fix OTP Input & Verify Button Layout on Mobile

### Problem
The OTP input field (6 digits with wide letter spacing) and the "Verify" button are in a horizontal flex row that overflows on iPhone 13 (375px width). The input uses `text-xl tracking-[0.4em]` which is wide, and the button has `whitespace-nowrap` and `px-4`, causing horizontal overflow.

### Fix

**File: `src/components/game/ProfileScreen.tsx`**
- Change the OTP input row from `flex gap-2` to a vertical stack: use `flex flex-col gap-2` instead
- Make the OTP input full width and the Verify button full width below it
- Keep the button styling but remove the rigid horizontal layout

### Changes

Lines 313-335 — Restructure the OTP input area:
```tsx
{/* OTP input area - stacked vertically on mobile */}
{otpStep === 'sent' && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    className="mt-3 space-y-2"
  >
    <label className="text-game-muted text-xs font-body uppercase tracking-wider block">Enter OTP</label>
    <div className="flex flex-col gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={otp}
        onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
        placeholder="• • • • • •"
        className="w-full bg-game-surface text-game-text rounded-xl px-4 py-3 font-body border border-game-card focus:border-game-gold focus:outline-none transition-colors text-xl tracking-[0.4em] text-center font-mono"
      />
      <button
        onClick={handleVerifyOTP}
        disabled={otp.length !== 6 || otpVerifying}
        className={`w-full px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
          otp.length === 6
            ? 'gold-gradient text-white hover:scale-105 active:scale-95'
            : 'bg-game-card text-game-muted cursor-not-allowed'
        }`}
      >
        {otpVerifying ? 'Verifying…' : 'Verify OTP'}
      </button>
    </div>
    <div className="flex justify-between items-center">
      <button
        onClick={handleResend}
        disabled={resendTimer > 0 || otpSending}
        className={`text-xs font-body ${resendTimer > 0 ? 'text-game-muted' : 'text-game-gold hover:underline'}`}
      >
        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
      </button>
    </div>
  </motion.div>
)}
```

Key changes:
- `flex` → `flex flex-col` for vertical stacking
- `flex-1` → `w-full` on the input
- `whitespace-nowrap` removed, `w-full` added to button
- Button text changed from "Verify" to "Verify OTP" for clarity
- `text-xs` → `text-sm` on button for better touch target

Single file change, no backend modifications.

