---
"@olympusoss/canvas": minor
---

Add a specular edge to the glass surface on web and Android. In glass/frost mode the
functional-layer material now paints a scheme-adaptive lit rim (bright top edge, faint
perimeter hairline, soft bottom shade) over the existing blur, giving a more "liquid glass"
look. Built with the cross-platform `boxShadow` style prop, so it renders identically on web
and Android. iOS is unchanged: it keeps its native `GlassView` Liquid Glass material (the
rim lives only in the web/Android `glass-surface` file).
