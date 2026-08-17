---
"@nannier/canvas": minor
---

Alert gains the width measure axis, a new public capability: boolean props `narrow` (320px cap), `wide` (640px cap), and `block` (fill the container, no cap) around the default 480px cap. Every measure is a maximum, never a floor: the banner rides width 100% under the cap and still shrinks to its container, so a column of alerts is the same measure top to bottom. The caps sit one step up the field width ladder (narrow 320 matches a base-width field, the default 480 matches a wide one), so a banner over a form lines up with its fields. Axis precedence is first-match narrow > wide > block.
