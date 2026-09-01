---
"@nannier-com/canvas": patch
---

TabBar: draw Material 3's active-indicator pill on web, not only on Android. Web
is the one platform where a bottom bar and a nav rail are the same app seen at two
widths, since an app shell swaps `Sidebar` for `TabBar` across a breakpoint and the
user carries the memory of one across the resize. `Sidebar` marks its active row
with a filled surface behind the row, so a tint-only bar made "you are here" change
species at that breakpoint, which a consumer's visual audit caught. The pill is the
M3 one by construction, tonal brand tint and all, scaled to 48x28 for the 12pt
shorter web bar. The iOS skin is untouched: a phone app has no rail to disagree
with, so this stays a web departure rather than a change to the HIG look.
