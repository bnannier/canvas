---
"@nannier/canvas": minor
---

Web hand-off: ship the `surface` and `density` theming axes, which the kit's own
public API already assumed existed. `setSurface()` and `setDensity()` (exported
from the package, alongside `getSurface`/`getDensity`) write `data-surface` and
`data-density` onto the document element, but `styles/canvas.css` shipped no rule
that responded to either attribute, so on the web both helpers were inert: they
set an attribute and nothing changed. `styles/tokens/surface.css` and
`styles/tokens/density.css` are now part of the stylesheet, imported between
`platforms` and `motion` exactly as the design hand-off orders them.

With them in place `data-surface="glass"` switches `--popover` to the translucent
glass fill, sets `--surface-mode`, paints the orb backdrop the frosted panes
refract, and carries the accessibility fallbacks that turn translucency off under
`prefers-reduced-transparency`, `prefers-contrast: more`, and `print`.
`data-density="compact" | "comfy"` remaps the padding steps (`--p-card-pad`,
`--p-card-gap`, `--p-table-cell-pad-y`) to the values each platform skin already
declares for that level, so compact under `data-platform="ios"` is iOS's own
compact metric. Density moves padding only, never type size and never radius.

Also adds the three z-index reserve tokens the hand-off carries in
`spacing.css` (`--z-raised: 10`, `--z-dropdown: 40`, `--z-overlay: 50`), so a web
consumer can layer against the same shallow scale the components use.

Minor because it adds user-visible capability to a published export path: two
theming axes a web consumer can now actually switch, and three new tokens. No
existing token changed value. Verified by diffing all 2214 declarations in the
hand-off against the shipped CSS (zero mismatches, zero missing) and by reading
the computed custom properties out of a browser with each attribute applied.
