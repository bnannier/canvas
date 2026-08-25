---
"@nannier/canvas": minor
---

Tooltip accepts an arbitrary element trigger (children), showing on the child's
hover and focus without claiming its press.

Minor justification (new public capability): `TooltipProps` gains `children`, so
a tip can hang off a control the app ALREADY has (an icon `Button`, a `Chip`)
instead of one of Tooltip's three built-in triggers. A console's "Glass on" /
"Glass off" icon Button can carry a tooltip and keep its own `onPress`, which
was impossible before: the tip had to be a separate trigger beside the control.

Trigger precedence, first match wins: `children`, then `iconTrigger`, then
`textTrigger`, then the default text Button. Passing no children leaves every
existing call site rendering exactly as before.

The child renders as-is. The only node Tooltip adds is its root view, which
takes NO accessibility role and no tab stop, installs no press responder, and
listens only for hover (RN's `onPointerEnter` / `onPointerLeave`, touch pointers
skipped) and focus. So the child stays the single interactive, labelled element:
a `Button` child keeps its `onPress`, never lands inside a second button (which
would be invalid markup and an ambiguous control), and the tip does not toggle
on tap.

The disclosure sits on the ROOT view rather than a wrapper hugging the child on
purpose. The bubble renders in flow, so opening it pushes the trigger over by
the bubble's height; a child-hugging hover region would be shoved out from under
a stationary pointer and the browser's post-layout hover recompute would close
the tip the instant it appeared (observed in Chrome). The root spans the bubble
too, so the tip stays up and hovering the bubble itself keeps it up.

Native fires no hover at all and an element trigger has no tap toggle, so the
controlled `open` prop remains the native and touch path; the `.md` says so.
