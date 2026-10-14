---
"@nannier/canvas": minor
---

Navbar takes a `bare` surface: no fill, no material and no hairline, so the bar sits clear on whatever is behind it. It is the scroll-edge appearance of iOS's navigation bar and Material 3's top app bar: pass it while nothing has scrolled under the bar and drop it once content does, so the bar's own surface returns to keep its labels legible. A framed bar (`bordered`, `floating`) keeps its frame over `bare`.

Minor, justified: a new public option on an existing component (the Navbar's surface axis gains `bare`). The docs' top bar uses it on Dark Factory's frosted frame, clear at rest as Dark Factory's own top bar is, frosted once the page scrolls under it.
