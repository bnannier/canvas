---
"@nannier/canvas": minor
---

Add `brandColors` and `statusHues` to the token layer, and fix the light-mode `--ring`

**New public API, which is what makes this a minor.** Two exports join the style
foundation, both reachable from the package root:

- `brandColors` (with its `BrandColors` type): the three fixed brand constants
  that do NOT flip with the scheme, `orb-indigo` / `orb-violet` / `orb-cyan`.
  The CSS layer has shipped these as `--orb-*` since the token handoff, but there
  was no JavaScript equivalent, so a React Native surface (and any docs page)
  had to hard-code the hexes. Keys are the CSS custom-property names verbatim,
  so `brandColors["orb-indigo"]` and `var(--orb-indigo)` are the same value by
  construction, and `bun run validate-tokens` now fails when a key here has no
  matching `--name` in the shipped CSS (the guard `lightColors` already had).
- `statusHues` (with its `StatusTone` type): the one status-tone to palette-hue
  map, `success` to green, `warning` to amber, `error` to red, `info` to blue.
  Alert and Badge each carried a private, identical copy; both now read this one,
  so a toned Alert and a status Badge cannot drift apart. It names the hue only,
  never a step, so each component keeps its own step ladder. No rendered color
  changes.

**Fix:** the light-mode `--ring` in `styles/tokens/colors.css` shipped the DARK
primary (`oklch(0.585 0.233 277.117)`) in both `:root` and `.dark`. Ring tracks
primary per scheme, which the JS tokens have always done (`#4f46e5` light,
`#6366f1` dark), so `:root --ring` is now the light primary
`oklch(0.511 0.262 276.966)`. Focus rings on a light web surface pick up the
slightly deeper indigo they were always meant to have; dark is unchanged.
