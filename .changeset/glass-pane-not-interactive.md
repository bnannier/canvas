---
"@nannier/canvas": patch
---

GlassPane no longer asks iOS 26 for interactive Liquid Glass. A pane passes every tap through to the control it paints behind (`pointerEvents="none"`), so React Native disables user interaction on it and its glass never received the touch Apple's interactive glass responds to: on the iOS 26 simulator a pressed glass Button showed only its label's dim, the same as before this change. The Button, Chip, Select, Calendar day, Carousel arrow, Navbar link, Sidebar row, TabBar tab, Tabs trigger and Stepper button panes stop requesting it, and GlassPane stops forwarding it, which also stops the native view reinstalling its glass effect each time a control is enabled or disabled; the resting look is unchanged and the control's own dim carries the press. `GlassPaneProps.interactive` stays as a deprecated no-op, so code that passes it still compiles. GlassSurface's `interactive` is documented to act only on a surface that itself receives the touch.
