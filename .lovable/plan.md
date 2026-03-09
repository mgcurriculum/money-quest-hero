

# Plan: Rewrite All Questions in Simple, Formal Indian English

## Problem
Current questions use informal gaming language ("BOSS BATTLE!", "TRAP DETECTED!", "Quest unlocked!", "*swipes*", "Nah", emojis in question text) that is difficult for many Indian users to understand. The tone needs to be simple, clear, and professionally communicative.

## Scope
- **169 active questions** in the database across 7 levels
- **Hardcoded fallback questions** in `src/data/questions.ts`
- **Narration prompts** in `src/utils/narrationPrompts.ts` (minor cleanup)

## What Changes

### 1. Database Migration — Rewrite all 169 questions
Replace all question text and option text with simple, formal Indian English:

**Before:**
```
🕸️ TRAP DETECTED! Your friend says: 'Just use Buy Now Pay Later — everyone does it!' The siren song of easy money plays... 🎵
Options: "Sounds genius! *clicks buy*", "Hard pass! I don't borrow for wants!"
```

**After:**
```
Your friend suggests using a Buy Now Pay Later option for a purchase you do not need right now. What would you do?
Options: "I would use it immediately without thinking", "I never borrow money for things I do not need"
```

Rules applied across all 169 questions:
- Remove all emojis from question text (keep emojis only in option emoji field)
- Remove gaming framing ("Boss Battle", "Trap Detected", "Quest unlocked", "Power-Up")
- Use complete sentences, no slang ("Nah", "Hmm", "*scrolls past*")
- Keep scenarios relatable to Indian context (UPI, EMI, SIP, gold loans, etc.)
- Simple vocabulary — no jargon without context
- Formal but warm tone, not stiff

### 2. Update `src/data/questions.ts` — Fallback questions
Rewrite the ~14 hardcoded scenario questions and 4 reality questions with the same formal tone. Remove gaming framing from scenario `situation` fields.

### 3. Update `src/utils/narrationPrompts.ts` — Minor refinements
The narration prompts are already mostly clean. Small adjustments:
- Replace informal phrases like "on point", "locked in", "like a pro" with formal alternatives
- Example: "Your spending discipline is on point!" → "You manage your spending very well."

## Files Changed
- **New migration** — UPDATE statements for all 169 questions (question_text + options JSON)
- **Modified**: `src/data/questions.ts` — rewrite fallback scenarios
- **Modified**: `src/utils/narrationPrompts.ts` — tone adjustments

