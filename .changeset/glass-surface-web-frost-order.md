---
"@nannier/canvas": patch
---

On the web a glass surface's tint now paints over its backdrop blur, the way Dark Factory's frost paints its background over its own filtered backdrop. The tint used to paint as a layer beneath the blur, so the blur sampled the surface's own tint (against the materials law that no material samples itself), and at a rounded corner the wedges outside the tint's curve, where the page showed unfilled, bled into the blur as faint hard-edged blocks, most visible at the top corners of a Dialog over its scrim in blush and mint. Every layer's tint, a wash, a brand colour, a sheer pane's opacity, the 24 px blur, the hairline rim, the shape, the clip and the footprint are unchanged; inside a surface the colour is the same, and only its edges and corners differ. Solid mode, Reduce Transparency, Increase Contrast and the iOS and Android materials are unchanged.
