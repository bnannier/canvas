---
"@nannier/canvas": minor
---

Tooltip: the tip now shows on hover and on focus, not only on tap. Hovering any trigger flavor (the default Button, `iconTrigger`, `textTrigger`) opens the bubble and leaving closes it; keyboard focus opens it and blur closes it; tapping still toggles it as the touch analogue (hover events never fire for touch pointers, so the two paths don't fight). The uncontrolled "On hover" docs variant was inert on hover before this. To wire the default trigger, Button gained optional `onHoverIn` / `onHoverOut` / `onFocus` / `onBlur` callbacks forwarded to its Pressable (backward-compatible; useful for any hover-driven disclosure).
