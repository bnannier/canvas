---
"@nannier/canvas": patch
---

Under glass on the web the Dialog's and AlertDialog's scrim now paints its dim and its 2 px blur as one layer beneath the card, as Dark Factory's scrim is one element whose background paints over its own blurred backdrop. The blur used to lie on a layer of its own under a role node that wore the dim, so it sampled that dim (against the materials law that no material samples itself), which showed as a light fringe about 3 CSS px wide at a contained scrim's rounded corners, up to 26 levels a channel off the solid scrim in blush and mint (the docs' inline Dialog); after it, the corners differ from solid by no more than the blur's own softening of the page, 3 to 4 levels. The scrim's colour, the 2 px blur, the card's frost sampling the dimmed page, the dismiss target, the accessibility hiding, solid mode's markup, the full-window scrims (which showed nothing) and the native scrims are unchanged.
