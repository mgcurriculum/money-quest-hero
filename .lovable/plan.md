

## Plan: Restore Split Dimension Score Bars

**What:** Replace the single "Overall Evaluation" progress bar (lines 189-198) with individual per-dimension progress bars — one for each of the 7 dimensions, each showing its icon, label, and animated score bar.

### Changes to `src/components/game/ReportScreen.tsx`

Replace lines 189-198 with a `.map()` over `dimensionLabels` rendering 7 individual glass cards, each containing:
- Dimension icon + label on the left, score percentage on the right
- Animated `gold-gradient` progress bar showing `normalizedScores[i]`%

```tsx
{dimensionLabels.map((label, i) => (
  <motion.div key={label} className="glass-card rounded-2xl p-4 mb-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-game-text font-display text-sm">{dimensionIcons[i]} {label}</span>
      <span className="text-game-gold font-display font-bold">{Math.round(normalizedScores[i])}%</span>
    </div>
    <div className="h-2.5 bg-game-card rounded-full overflow-hidden">
      <motion.div className="h-full gold-gradient rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(normalizedScores[i])}%` }}
        transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: 'easeOut' }} />
    </div>
  </motion.div>
))}
```

### File modified
- `src/components/game/ReportScreen.tsx` — lines 189-198

