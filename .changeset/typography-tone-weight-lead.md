---
"@bnannier/canvas": minor
---

Extend `Typography` with orthogonal tone and weight axes plus a `lead` role, so
styled text no longer needs a raw `<Text style={{ fontSize, fontWeight, color }}>`
shim. The 13 existing roles are unchanged; two new axes layer on top: a tone
(`subtle`/`primary`/`destructive`/`positive`/`warning`) sets the color and a
weight (`regular`/`medium`/`semibold`/`bold`) sets the fontWeight, each null by
default so a role's own color and weight stand when untouched. The new `lead`
role is a 16px body/identity size (e.g. `<Typography lead semibold>` for a name).
Fully backward-compatible.
