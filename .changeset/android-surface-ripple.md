---
"@olympusoss/canvas": minor
---

Add the Android Material ripple to every tappable surface that previously only dimmed opacity on press: Card, MediaObject, GridList, Stats, Listbox rows, the tappable Avatar, and the CodeBlock copy, Alert dismiss, Tooltip icon, and bottom-sheet header buttons. On Android the ripple state layer now carries the press feedback (the opacity dim is skipped there); iOS and web are unchanged. Adds the `surfaceRipple`, `controlRipple`, and `pressDim` style helpers so custom Pressables can adopt the same platform-correct feedback.
