---
"@nannier/canvas": patch
---

ActionSheet: the backdrop now fades in instead of sliding up with the sheet.

React Native's `Modal animationType="slide"` transforms the whole modal window,
and the dimmed scrim lives inside it, so the backdrop used to travel up from the
bottom edge along with the sheet. ActionSheet now drives the motion itself
(`animationType="none"`, matching Drawer): a stationary full-screen dim layer
fades from transparent to the skin's alpha while only the sheet slides on
translateY. The Modal stays mounted through the exit so the slide-out is visible,
then unmounts, and reduced-motion settings collapse both to zero duration.
