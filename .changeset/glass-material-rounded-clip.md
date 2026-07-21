---
"@nannier/canvas": patch
---

GlassSurface: the frost material now follows the surface's corner radii. The fill, blur, and Liquid Glass layers previously rendered as radius-0 absolute fills and relied on the parent's rounded overflow clip; on web a browser clips a backdrop-filter's result to the filtered element's own border-box, so the blur bled past rounded corners as a square halo (glaring on circular surfaces such as the Avatar initials fallback in glass mode). The material layers now carry the skin's radii, matching the specular rim.
