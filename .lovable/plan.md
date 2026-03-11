

### Task: Replace Age Group Selection with Age Number Input

**Problem:** Currently the profile flow has 3 steps — step 0 (name/details), step 1 (age group selection), step 2 (role selection). The age group step is redundant since we can collect the user's age as a number in step 0 and auto-determine the age group.

**Plan:**

1. **Add age number input to step 0** in `ProfileScreen.tsx`
   - Add an `age` state variable (number input)
   - Add an "Age" input field in the step 0 form (required, min 18)
   - Update `canProceedStep0` to also require a valid age

2. **Auto-determine age group from age number**
   - Create a helper function: `getAgeGroup(age: number)` → maps to `18-25`, `26-39`, `40-59`, `60+`
   - On step 0 "Next", compute `selectedAgeGroup` automatically

3. **Remove step 1 (age group selection)**
   - Reduce flow to 2 steps: step 0 (profile + age) → step 1 (role selection)
   - Update progress dots from 3 to 2
   - Update narration texts to remove the age group narration
   - Update step icons/titles accordingly
   - Step 0 "Next" now goes directly to role selection (old step 2)

4. **Filter roles based on computed age group**
   - The role selection step uses `selectedAgeConfig` which depends on `selectedAgeGroup` — this still works since we set it from the age number

5. **Update `PlayerProfile` and `GameContext`** — no changes needed since `ageGroup` is still stored, just derived from the number now. The `player_age` column in `game_sessions` can store the actual age number.

