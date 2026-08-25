---
"@nannier/canvas": minor
---

Structural narrow modes: Navbar auto-collapse, Steps `stacks`, Tabs
`responsive`, FilterPanel `responsive` drawer, GridList container basis.

Minor justification (new capabilities and props):

- Navbar now collapses AUTOMATICALLY at and below the `sm` container width: the
  links row swaps for a kit-owned menu button opening the platform Dropdown
  (active link checkmarked; `active`/`onSelect` unchanged). No new prop, and a
  deliberate default-behavior decision: the previous narrow rendering was a
  plain row clipping links off-screen, so there was no working behavior to
  preserve. GlassSurface gained an `onLayout` passthrough to support the bar
  measuring itself.
- Steps: opt-in `stacks` + `stackBreakpoint` (default `sm`) renders the
  EXISTING vertical layout when the component's own container is narrow
  (horizontal layout only; `vertical`/`progress` unaffected).
- Tabs: opt-in `responsive` renders a vertical rail as the existing horizontal
  underline look at and below `sm` container width.
- FilterPanel: opt-in `responsive` + `drawerBreakpoint` (default `sm`) collapse
  the docked panel to a kit-owned "Filters (n)" outline Button opening the
  panel in a start-edge Drawer; `open`/`defaultOpen`/`onOpenChange` drive it
  for controlled use.
- GridList's narrow collapse now measures its OWN container (viewport-seeded)
  instead of the window, so grids inside narrow desktop columns collapse too.
