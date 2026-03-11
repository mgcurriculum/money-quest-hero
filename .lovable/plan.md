
### Task: Remove dimension/category from FQ Test title header

**File to edit:** `src/components/game/QuestionPlay.tsx`

**Change:** Remove the dimension span from the header so only "FQ Test" displays.

**Current code (lines 95-100):**
```jsx
<motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center gap-2">
  <span className="gold-text font-display font-bold text-xs">FQ Test</span>
  {question.dimension && (
    <span className="text-game-muted text-[10px] font-body">{question.dimension}</span>
  )}
</motion.div>
```

**New code:**
```jsx
<motion.div className="glass-card rounded-full px-4 py-1.5 flex items-center">
  <span className="gold-text font-display font-bold text-xs">FQ Test</span>
</motion.div>
```

This removes the dimension text that was appearing after "FQ Test", resulting in just "FQ Test" in the header.
