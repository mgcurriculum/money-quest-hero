

### Task: Add "Clear All Questions" Button

**File:** `src/pages/admin/Questions.tsx`

**Changes:**

1. Add a **"Clear All Questions"** button in the top action bar (next to Export/Import buttons)
2. On click, open a confirmation dialog requiring the user to type **"clear all"** to proceed
3. Execute `DELETE FROM questions` (no profile filter) to remove all questions across all 19 profiles
4. Refresh both the question list and profile counts after clearing

**Implementation details:**
- Add new state: `clearAllConfirmOpen`, `clearAllConfirmText`
- Add a new `AlertDialog` similar to the existing per-profile clear dialog but with stronger warning text mentioning "all 19 profiles"
- The delete call: `supabase.from('questions').delete().neq('id', '')` (deletes all rows)
- Button styled as `variant="destructive"` with `Trash2` icon, labeled "Clear All Questions"

