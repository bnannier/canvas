---
"@nannier/canvas": patch
---

The Switch thumb, the Slider knob, ButtonGroup's segment and split glass and TabBar's icon pill no longer ask iOS 26 for interactive Liquid Glass. Each passes its taps through to the control it paints for (`pointerEvents="none"`), and GlassSurface's material layer passes every touch through to its content anyway, so the glass never received the touch Apple's interactive glass answers (the same was confirmed inert on a device for GlassPane, GP-9). Asking only made the native view reinstall its glass effect each time a segment was selected or a control changed state. The resting look is unchanged and each control's own press feedback carries the press. GlassSurface keeps its `interactive` prop, now documented as reaching only a glass view that receives the touch itself.
