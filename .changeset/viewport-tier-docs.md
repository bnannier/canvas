---
"@nannier/canvas": patch
---

The viewport tier is documented on the Layout & flexbox page (`/tokens/layout`): the buckets and the phone, tablet and desktop form factors (the window's width alone, on every platform), `responsive`, `Responsive`, `formFactor` and `FormFactor`, and `BreakpointOverride` with what it pins (the tier for every viewport reading under it, the portaled overlays it opens included), what it does not (container-measured components follow their real width; a drawer or phone sheet lays out against the real window) and its accessibility notes. The theming page's server-rendering guidance names ThemeProvider's `ssrBreakpoint`, and the Responsive pattern names Popover's phone sheet among the window-level readers.

DESIGN.md's responsive passage is restated from the design law: fill and hug inside the bounds the parent provides (no fixed width), the three container hooks and their bucket seed, the window-level readers (the drawer modes, an overlay's phone sheet, app shells), the thresholds, `base` for an unknown width, `ssrBreakpoint` and `BreakpointOverride`.
