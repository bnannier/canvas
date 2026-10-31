# Canvas v4 design hand-off

`handoff/` is the owner's v4 design hand-off ("Light as material"), vendored verbatim on
2026-10-27 from `~/Downloads/canvas_v4` so the design authority lives in the repository
(audit/v4-redesign/PLAN.md, decision D11). It is an HTML prototype, not source: open any
`handoff/*.dc.html` through a local static server (the pages load their sibling `.js`
files, Google Fonts and a QR code script from a CDN).

What reads it:

- `accent-samples.json`: the accent and chart colours Chrome renders for every hue and
  scheme in the hand-off, sampled through a 2D canvas. The kit's oklch conversion
  (`src/style/color.ts`) is held to them by `test/v4-accent.test.ts`.
- `capture-references.ts`: photographs the hand-off pages and cards into
  `.v4-reference/` (gitignored) as the design images Lookout's design-parity judge
  compares the docs against.

- `derive-detail-specs.ts` (`bun run v4:specs`, `--check` in `v4:specs:check`): runs the
  kit's `cv-kit*.js` and `canvas-docs.js` in a bare VM context and writes the component
  detail pages' specs (knobs, sizes, states, anatomy, keyboard tables) into
  `docs/src/core/data/detail-specs.ts` and the sections into
  `docs/src/core/data/detail-sections.ts`. `test/detail-specs.test.ts` holds every name
  they pass to a real prop; a hand-off knob the repository has no prop for is listed in the
  spec's `dropped` with its reason.

- `derive-detail-presentation.ts`: records the hand-off's specimen labels and order,
  guidance selection and note counts. Detail pages use that presentation with current
  executable examples, without deleting newer kit docs.

The owner selected this vendored snapshot for exact appearance and motion on2026-10-29
(PLAN D23), superseding older visual exceptions. Current public API rows remain accurate;
reference presentation does not remove newer capabilities. Compare matching live browser
states, including phone widths, scheme, palette, surface and animation phase. A screenshot
only proves the phase it captured. The reference runtime turns its nominal grain SVG into
uniform RGBA(187,187,187,128), which the docs reproduce as a translucent film.
