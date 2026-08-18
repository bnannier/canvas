---
"@nannier/canvas": patch
---

The light `ring` token is the hand-off's indigo-500 (`#615fff`, `oklch(0.585 0.233 277.117)`) again, the same value the dark scheme already carried. An earlier pass read the shared value as a dark-mode leak and pointed light `ring` at the light `primary`, which made a focus outline the same colour as the primary fill it often sits on, so the ring vanished on exactly the control it was marking. The ring is deliberately one value in both schemes: it has to read against a light page, a dark page, and the primary fill. Both the CSS custom property and the JavaScript token now carry it, so a React Native call site and the web token layer agree.
