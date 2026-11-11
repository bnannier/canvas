---
"@nannier/canvas": patch
---

Chat: two Claude desktop metrics that still applied to the default Chat now apply only under `assistant`, so the default follows the v4 hand-off's message renderer.

- The person's own turns carry no author line in the default Chat, even when the app names an `author`, `provider` or `providerIcon`; a reply keeps its author line when named, as before. With `assistant`, a named turn of either speaker keeps its author line, as the desktop layout drew it.
- A folded activity line's label is 13 / 18 in the subtle ink in the default Chat (the hand-off draws no activity line, so it keeps the label activity lines were introduced with); `assistant` keeps the desktop window's 14 / 21 in the muted ink.
