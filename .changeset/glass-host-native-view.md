---
"@nannier/canvas": patch
---

A glass surface's material now stays inside its own surface on iOS and Android. Under glass a surface's own fill and border colours give way to the material, and React Native's renderer then removed the surface's view as a box that draws nothing and handed its children to the nearest ancestor view, where the material's `zIndex: -1` ordered it beneath every earlier sibling there: a glass card placed over an image or text drew its material under them, the text on top at full contrast (on the docs' Select page 11 of 39 materials sat in the page's content view instead of their cards). The surface's view is now kept wherever its material renders (`collapsable={false}`), so the material paints beneath that surface's content only. Nothing changes on the web or in solid mode.
