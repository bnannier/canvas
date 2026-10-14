---
"@nannier/canvas": patch
---

On iOS's and Android's frost the specular rim no longer draws a stray line across a tall surface for its first frame. The rim mounted as one rim capped at a band's height and split into bands only once the surface's first layout arrived, so for one frame a surface taller than a band (a docs Props table) drew the capped rim's bottom edge across itself. The rim now reads the surface's height in the commit that mounts it, which React Native's New Architecture lays out before the frame is drawn, so the first frame already holds the whole rim or its bands; where no height can be read it waits for the first layout rather than guess. The single rim also spans its surface without a cap, so a surface that grows ahead of its next layout keeps its bottom edge at its own end. Solid mode and the web, which draws no specular rim, are unchanged.
