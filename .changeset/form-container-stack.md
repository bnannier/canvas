---
"@nannier/canvas": patch
---

Form `twoColumn` stacks by CONTAINER width; Sidebar warns on phone-width rails.

- Form's two-column collapse now measures the form's own row wrapper instead of
  the window, with a threshold of one `wide` field (480px): a two-up split
  narrower than that cannot give each column a usable field. Behavior change,
  flagged: a `twoColumn` form inside a narrow desktop column (a split pane, a
  docs 3-up) now stacks where it previously stayed two-up and crushed; forms
  560px and wider keep their two-up layout everywhere. New public hook riding
  along: `useContainerWidth()` (own width with a window fallback until the
  first layout).
- Sidebar: a non-`responsive` sidebar rendering at a phone-width viewport now
  logs a one-time DEV warning pointing at the `responsive` prop; the rail is
  unusable chrome there and the drawer needs a consumer-wired hamburger, so the
  gap is surfaced instead of silently rendering a 240px column.
