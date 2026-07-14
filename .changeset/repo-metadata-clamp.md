---
"@nannier/canvas": patch
---

Point the package metadata at the current repository. `homepage`, `repository`, and
`bugs` now reference `bnannier/canvas` and `bnannier.github.io/canvas` (the repo was
transferred from the `OlympusOSS` org, and GitHub Pages URLs do not redirect).
Internal: the duplicated `clamp` helper is now shared from `src/style/math.ts`.
