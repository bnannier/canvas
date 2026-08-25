---
"@nannier/canvas": minor
---

Container-measurement primitives: `useMeasuredWidth()` and
`useContainerBreakpoint()`.

Minor justification (new public API): the middle tier of the responsiveness
system. `useMeasuredWidth` measures the element its `onLayout` is attached to
(stable handler, re-renders only on rounded-width changes);
`useContainerBreakpoint` resolves a `Responsive` map against the element's OWN
width instead of the window, with an optional `seedViewport` for
above-the-fold grids. Components that switch layout should measure their
container, not the viewport: a component cannot know whether it is on a phone
or in a 320px desktop panel.

Internal adoption, no behavior change: the six components that hand-rolled the
identical trigger-measurement handler (Dropdown, Select, Autocomplete,
Popover, RowMenu, ButtonGroup) and DataTable's own-width measurement now ride
these hooks.
