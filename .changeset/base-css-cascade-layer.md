---
"@nannier/canvas": patch
---

The web hand-off's base rules move into `@layer base`, so an app can override them.

`styles/tokens/base.css` emitted `*`, `body`, `a`, and `a:hover` unlayered. An
unlayered rule outranks every layered one regardless of order, so a consuming
app could not restyle an anchor at all: `a{color:var(--primary)}` beat
`.text-primary-foreground`, and an anchor carrying a button's fill painted its
label in the link colour, which is invisible on a primary fill. The same rules
inside `@layer base` still win over a framework reset (they are imported after
it, and layers resolve in declaration order) while losing to the component and
utility layers. The `@keyframes` blocks stay unlayered, since layers order
keyframe-name resolution too.
