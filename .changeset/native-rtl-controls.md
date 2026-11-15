---
"@nannier/canvas": patch
---

Keep RTL Slider paint aligned with physical touch coordinates when React Native swaps left/right styles. RadioGroup and ChipGroup now use the shared layout-direction reader for horizontal keyboard navigation.

Slider retains enabled drag gestures inside native scrolling containers, preventing a parent ScrollView from ending a drag after its first movement. Disabling the slider allows the parent to take ownership again.
