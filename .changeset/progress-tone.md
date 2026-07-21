---
"@nannier/canvas": minor
---

Progress gains a `warning`/`danger` tone axis. Pass `warning` to tint the active fill amber or `danger` to tint it red, for a metric that has crossed a soft threshold or a hard limit (a work-in-progress meter over its cap, storage near full). The tone recolors only the fill (the track stays neutral) and draws from the same palette the Badge status pills use, so the kit speaks one semantic-color language. `danger` beats `warning` when both are passed; the default keeps the brand primary fill. The tone is a visual reinforcement and carries no new accessible value, so pair it with copy for non-visual users.
