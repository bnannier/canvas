---
"@nannier/canvas": minor
---

The Canvas v4 Layout page's cards get the kit pieces they lacked (justification for the minor: new public options on Badge, MediaObject, DataTable and Form). Badge takes `contrast` (the ink as the fill under the page colour) and `dashed` (the placeholder outline) on its tone axis, `tick` (the 20 px ruler readout) and `step` (a 32 px numbered square in the tone's fill, the solid one glowing) on its metric axis, and `keyCorners` (the key cap's 6 px corner on any size); a `band` or `tick` pill no longer leads with a tone's dot. MediaObject takes `bareIcon`, the `icon` drawn with no box, for a `<Badge step>` lead. DataTable takes `bare`, the unframed hairline table. Form takes `block`, its actions splitting the row equally. A MediaObject `body` that is a node (not a string) lays out as a block instead of inside a text run. Divider's label sits on JetBrains Mono's normal 14 px line, the hand-off's.
