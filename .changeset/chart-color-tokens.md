---
"@olympusoss/canvas": minor
---

Add `chart-1`..`chart-8` categorical series tokens to `ColorTokens` (light and
dark), making the data-viz palette brandable via `ThemeProvider` token
overrides. The palette is validated against both card surfaces for OKLCH
lightness band, chroma floor, adjacent-pair colorblind separation, and 3:1
contrast: indigo-500, teal-600, orange-600, rose-500, violet-500, cyan-600,
emerald-600, pink-500. `StackedBar` segment colors now read these tokens; four
hues shift one step from the previous hardcoded set (teal/cyan/emerald 500 to
600, amber-500 to orange-600) so every mark clears 3:1 contrast on white and
the dark lightness band. BREAKING-ADJACENT for CSS consumers: the
`--chart-1..5` variables in `styles/canvas.css` (previously an unrelated
5-hue set) now carry these same values, and `--chart-6..8` are new.
