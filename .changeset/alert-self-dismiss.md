---
"@nannier/canvas": minor
---

Alert: the dismiss control now works out of the box. Pressing the trailing "×" of a `dismissible` Alert hides the banner on its own (the kit's controlled + uncontrolled contract via `useControllableState`), instead of only firing `onDismiss` and sitting inert. New props: `dismissed` (controlled dismissal; `true` hides the banner) and `defaultDismissed` (uncontrolled seed). `onDismiss` still fires in both modes, so existing callers that hide the Alert themselves keep working, and callers that need to own the state pass `dismissed`.
