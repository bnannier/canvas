---
"@olympusoss/canvas": patch
---

Accordion and Collapsible no longer log "setLayoutAnimationEnabledExperimental is a no-op in the New Architecture". The Android LayoutAnimation flag is now flipped only on the old (Paper) architecture, where it is actually needed; on Fabric / Bridgeless it is on by default, so the call (and its warning) is skipped. New shared helper `enableAndroidLayoutAnimations()` centralizes the guard.
