---
"@nannier/canvas": patch
---

Add a render-based colour check: `bun run check-render`.

The kit already had two colour guards and both were structurally blind to the same class of error.
`validate-tokens` compares `styles/tokens/colors.css` to `src/style/tokens.ts`, and `check-parity`
compares the built types to a committed snapshot. Both sides of both checks live behind this
commit, so they can only prove the kit is internally consistent. That is exactly how the `--ring`
error survived: the CSS and the JS agreed with each other while both diverged from the design
source, and nothing could see it for as long as they agreed.

This check renders the hand-off's own colour guideline cards in chromium and reads the painted
pixels, then compares them against the shipped tokens. One side of the comparison is an input
nobody here can edit into agreement. Rendering rather than parsing also matters: a text parse gets
`var()` chains, `color-mix(in oklab, …)` and out-of-gamut clipping wrong, while the browser
resolves all three and a painted pixel is what a user actually sees.

Verified by faithfully reproducing the ring bug — putting the wrong light `--ring` into BOTH the
CSS and the JS so they agree, as they historically did. `validate-tokens` passes, `check-parity`
passes, and this check reports the drift.

Two legs, and the difference is stated wherever a reader will meet it. `--handoff <path>` renders
the real export and is authoritative; the default renders a vendored copy under
`tools/render-parity/handoff/` so CI can run at all. The vendored copy is itself behind this commit,
so a green CI proves only that the kit has not drifted from the snapshot — refreshing that copy when
the hand-off changes is where the real comparison happens.

One accepted difference is recorded in `baseline.json`: dark `warning` is one step apart on the blue
channel at a rounding boundary, where the exact conversion gives 9.4506 and Chrome paints 10.

Patch: repository tooling, no change to the published package.
