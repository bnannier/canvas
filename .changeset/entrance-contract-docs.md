---
"@nannier/canvas": patch
---

`Entrance` and `EntranceProps` carry JSDoc that states the readiness hold's contract exactly: while held a card is invisible, takes no touch or click and is hidden from VoiceOver, TalkBack and the web's accessibility tree, its controls stay mounted (and, on the web, in the Tab order, so a hold lasts only the frame or two a placement takes), focus enters only at release, `ready` defaults to true and an enclosing hold holds it too, and `style` is the wrapper's layout and position only, never a restyle. The hold has no motion, so Reduce Motion has nothing to remove. Documentation only; nothing changes at runtime.
