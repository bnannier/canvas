---
"@nannier/canvas": patch
---

Under glass a selected Card and a checked Radio card now paint the same soft primary tint as in solid, 5 percent, in blush, mint and dark (the owner's GP-2b decision). This is a rendered change: the glass selection wash was capped only for legibility, which left it about a point heavier than solid's tint in the light palettes and about 15 percent in dark, where the card read visibly violet and its title and description fell from 11.2:1 and 5.5:1 to 9.5:1 and 4.7:1. The wash's ceiling is now the solid recipe's own tint, read from one constant that Card and Radio's card chrome share (they each wrote the 5 percent literal before), and it is still capped where the card's text would lose 4.5:1. Solid mode renders exactly as before.
