---
"@olympusoss/canvas": minor
---

Accessibility + API polish across the kit:

- **Ref forwarding**: `Input` and `Textarea` now forward a ref to the underlying `TextInput`, so consumers can call `inputRef.current?.focus()` (and friends). Both also set a `displayName` for better DevTools/stack traces.
- **Modal a11y**: `Dialog`, `Drawer`, and `AlertDialog` set `accessibilityViewIsModal`, and icon-only close controls get an `accessibilityLabel`, so assistive tech treats the backdrop as inert and announces the dismiss control.
- **Hit targets**: small icon-only controls (Pagination, Calendar month chevrons, Checkbox/Radio boxes, Tooltip trigger) get `hitSlop` toward the 44pt minimum.
- **Divider** announces itself as a `separator` to screen readers.
- **New export `FOCUS_RESET`**: one shared web-only focus-outline reset, replacing the constant that was re-declared in ~11 files (consumers can use it for custom focusable controls).
