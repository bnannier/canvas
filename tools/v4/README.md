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

Where the prototype and the repository disagree on an API, the repository wins.
