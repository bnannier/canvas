---
"@nannier/canvas": minor
---

Textarea gains a `showCount` prop: the component now renders its own live character-count line (an end-aligned muted caption under the field reading "N / max", "N" when no `maxLength` is set) inside its own anatomy, instead of callers hand-composing a `Typography` counter beside a bare field. When `showCount` is on, `maxLength` becomes a SOFT cap: it is no longer forwarded to the native TextInput (a hard cap silently drops the overflow keystroke, so the overage could never be shown), so the user can type past it, and once the count exceeds the cap the count line turns destructive and the field enters its error state automatically. The count type is part of each platform skin (muted normal, destructive over) so light/dark/glass and the per-OS caption conventions keep working.
