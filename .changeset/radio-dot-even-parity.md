---
"@nannier/canvas": patch
---

Radio: center the selected dot at every pixel density. Every ring diameter in the kit is even, but three inner-dot diameters were odd (iOS default 9, Android small 9 and large 11), so those dots could not land on the pixel grid when centered in their even ring and rendered a half-pixel down and to the right with soft, antialiased edges (most visible at higher densities and on the web preview of the iOS skin). Those dots are now even (iOS 8/10/10, Android 10/10/12), so the dot is pixel-centered with crisp edges on iOS, Android, and the web. No API change; the selected dot is at most one pixel larger.
