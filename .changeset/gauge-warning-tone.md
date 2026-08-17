---
"@nannier/canvas": minor
---

Gauge: new `warning` tone boolean on the tone axis. `<Gauge warning />` fills the arc with the kit's shared warning amber (the same statusHues hue a warning badge or alert reads), for dials like a budget-used gauge. Minor because it adds a new public prop, a user-visible tone capability; the existing tones and the default primary fill are unchanged. Tone precedence within the axis is success > warning > destructive (first match wins).
