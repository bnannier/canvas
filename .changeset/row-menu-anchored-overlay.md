---
"@olympusoss/canvas": patch
---

Fix RowMenu clipping its open menu inside scroll/stage containers by routing the panel through AnchoredOverlay so it portals over the page instead of rendering as an inline absolute card.
