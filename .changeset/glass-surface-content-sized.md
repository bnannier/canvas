---
"@nannier/canvas": patch
---

GlassSurface: a content-sized surface (no explicit width/height/flex on its style) no longer collapses to its padding on native in glass mode. The inner clip box now uses flexGrow/flexShrink with an auto flex basis instead of the `flex: 1` shorthand, whose 0% basis contributed nothing to an auto-sized outer box under Yoga (which has no min-content floor, unlike web flexbox; this is why the bug only showed on iOS/Android). Sized surfaces (explicit height, flex-filled sidebars, minHeight bars, absolute-pinned drawers) lay out identically to before, and solid mode is untouched. Fixes the ActionSheet rendering as a collapsed bar under iOS 26 glass; also un-collapses every other content-sized glass overlay on native (Dialog, AlertDialog, Popover, Command, dropdown/select/menu cards, the bottom Sheet).
