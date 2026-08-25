---
"@nannier/canvas": minor
---

ActionPanel: embedded children between the copy and the action.

Minor justification (new public capability): ActionPanel accepts children
rendered between its copy and action, so settings panels can embed field rows.
`ActionPanelProps.children` is a `ReactNode`, and where it lands follows the
layout the panel already resolves: stacked, it joins the panel's gap column
between the copy and the action, so each element of the block is spaced by the
skin's stacked gap; inline and in toggle mode the action stays pinned beside the
copy, so the block renders full width below that row on the same rhythm. No skin
field was added, and a panel that passes no children renders exactly as before.
