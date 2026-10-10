---
"@nannier/canvas": patch
---

The docs app on iOS and Android gains the Blush/Mint palette choice, in the light scheme only: a Palette section of check-marked rows in the iOS header menu, and a Palette row of the kit's segmented ButtonGroup in the Android menu drawer's footer. The desktop web Topbar stays as it is, because at the desktop cut the longest page title leaves 116 px and the control needs 124. The docs Sidebar adapter now takes its drawer footer from the shell that opens it instead of deciding by platform, and unit tests pin the control's choices, its absence in the dark scheme and the iOS section's check marks. Repository tooling and docs only; nothing in the package changes.
