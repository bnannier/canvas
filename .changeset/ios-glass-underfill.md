---
"@bnannier/canvas": patch
---

Fix invisible glass surfaces on iOS 26. The Liquid Glass (`GlassView`) material path
now paints the translucent `popover` under-fill beneath the material, exactly as the
frost path already does. A bare regular-glass panel composites nearly clear over a
flat surface (and clear over the page in a portaled overlay), so a glass menu, select,
or dialog whose fill and border are stripped under glass was rendering as an invisible
hole with its contents floating on whatever sat behind it. The under-fill guarantees a
legible material while the glass still refracts through the remaining translucency.
