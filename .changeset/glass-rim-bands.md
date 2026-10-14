---
"@nannier/canvas": patch
---

A tall frosted surface on iOS no longer draws flat dark tiles over its content. The native frost's specular rim, React Native's inset `boxShadow`, is drawn by iOS as one Core Animation shadow over the whole surface, and Core Animation renders no such shadow past 8192 px on a side: a frost taller than about 2730 pt at 3x (a long DataTable, the docs' Props tables at 4158 pt) showed grey rectangles over its rows that moved with them as the page scrolled. The rim is now drawn in bands of at most 4096 px, each the rim clipped to its band, so the bands together draw the same edge; a surface shorter than a band keeps its single rim. The rim's look is unchanged, on Android too, which draws its frost's rim the same way.
