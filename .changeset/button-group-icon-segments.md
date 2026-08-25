---
"@nannier/canvas": minor
---

ButtonGroup: icon segments.

Minor justification (new public capability): an item may pair its label with a
kit glyph (`items={[{ label, icon }]}`, new `ButtonGroupItem` type; strings
keep working untouched), and the group-level `iconsOnly` boolean renders each
segment as its glyph alone with the label as the segment's ACCESSIBLE name, so
an icon-only segmented control (a view switcher, the docs' form-factor
switcher) needs no hand-rolled look-alike. Glyph color tracks each platform
skin's segment label treatment (new `segmentIconColor` skin field); the
stepper and split kinds cycle the labels and ignore icons, with dev-only
warnings on misuse.
