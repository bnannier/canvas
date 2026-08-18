---
"@nannier/canvas": patch
---

Colors: align every semantic color token in `src/style/tokens.ts` with the web
hand-off (`styles/tokens/colors.css`), which is the source of truth for what the
tokens ARE. The hand-off authors its values in `oklch()`; the JS token set carried
hand-transcribed Tailwind v3 hexes instead, so the two sides had drifted on 13
values and a component painted one color natively while the CSS published another.
Six of those were plainly visible: `destructive` was `#dc2626` light / `#ef4444`
dark against the hand-off's `#e7000b` / `#ff6467`, and `primary` (with `ring`,
which tracks it) was `#4f46e5` / `#6366f1` against `#4f39f6` / `#615fff`. The rest
were sub-perceptual: `primary-foreground` and `destructive-foreground` resolve to
`#fafafa` rather than pure white, and `muted-foreground` and `warning` shift by one
or two 8-bit steps. Every token now carries the exact sRGB rendering of its
hand-off `oklch()`, so a native build and a web build paint the same pixel.

The `chart-1..8` series, the fixed brand constants, and the Tailwind v3 `palette`
steps were already in agreement and are unchanged.

`scripts/validate-tokens.ts` now cross-checks the two sides by VALUE, converting
each `oklch()` declaration back to sRGB and failing the build on any difference.
It previously checked only that every JS token NAME existed in the CSS, which is
what let the values drift apart unnoticed.

Patch, not minor: no new component, API, option, or platform. This corrects
existing token values to the specification they were always meant to carry.
