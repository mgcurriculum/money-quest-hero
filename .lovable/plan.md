

## Plan: Question Narration Changes, Report Narration, and Retake Shortcut

### 3 Changes Requested

---

### 1. Question Narration: Full instruction only for Q1, short for Q2+

**Current**: Every question says `"Question {N}. Read through and pick the answer that feels most like you."`

**Fix**: 
- Q1: `"Question 1. Read through and pick the answer that feels most like you."` (keep as-is)
- Q2+: Just `"Question 2"`, `"Question 3"`, etc.

**Files**:
- `src/components/game/QuestionPlay.tsx` — change the `speak()` call in the useEffect (line 35) to conditionally use full vs short text
- `supabase/functions/generate-all-tts/index.ts` — update the narration text list: Q1 keeps full text, Q2-18 become just `"Question 2"`, `"Question 3"`, etc.

---

### 2. Add Report Page Narration

Add a narration on the report screen that explains the results, e.g.:  
*"Here's your FQ Test report! Your overall score shows how financially aware you are. Check out the radar chart to see how you performed across six key dimensions like Earning, Spending, Saving, and more. You can download your report, share it with friends, or even take the test again to improve your score!"*

**Files**:
- `src/components/game/ReportScreen.tsx` — import `useNarration`, add `useEffect` to speak the report narration on mount
- `supabase/functions/generate-all-tts/index.ts` — add the report narration text to the pre-generation list

---

### 3. Retake Shortcut: Skip profile for verified users

**Current**: `RESET` action resets everything back to `step: 'welcome'` with blank profile, so returning users must re-enter all details.

**Fix**: On "Take Test Again", if `phoneVerified` is true (user already completed OTP), preserve the profile and phone verification status, and go directly to quiz.

**Files**:
- `src/context/GameContext.tsx` — add a new action `RETAKE` that keeps `profile`, `phoneVerified`, `consentGiven`, `campaignId`, `campaignCode` but resets `answers`, `currentQuestion`, `reflectionAnswer`, and sets `step: 'quiz'`
- `src/components/game/ReportScreen.tsx` — change the "Take Test Again" button to dispatch `RETAKE` instead of `RESET`

---

### Summary of All File Changes

| File | Change |
|------|--------|
| `src/components/game/QuestionPlay.tsx` | Q1 full narration, Q2+ short |
| `src/components/game/ReportScreen.tsx` | Add report narration + use RETAKE action |
| `src/context/GameContext.tsx` | Add RETAKE action type |
| `supabase/functions/generate-all-tts/index.ts` | Update Q2-18 texts to short, add report narration |

No database changes required.

