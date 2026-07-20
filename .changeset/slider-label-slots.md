---
"@nannier/canvas": minor
---

Slider owns its label anatomy, matching the Checkbox/Radio/Switch `description` precedent. Pass the title as `children` and it renders above the track (a slider's label sits above the rail, not beside it); pass `description` for a muted secondary line under it; pass `showValue` to render the live current value as a trailing readout on the title line (right-aligned, tabular figures, updating in real time as the thumb drags), or as a standalone trailing readout above the track when there is no title. When `accessibilityLabel` is omitted but the title is plain text, the accessible name is derived from it. A bare `<Slider />` renders exactly as before (no header, no wrapper node), and the field-width cap now spans the whole labeled group so the title aligns to the track.
