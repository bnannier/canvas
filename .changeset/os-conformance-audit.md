---
"@olympusoss/canvas": minor
---

Full OS design-language conformance pass across 32 components, matching each per-OS
skin to its reference (Apple iOS 27 UI Kit / HIG, Material 3 Expressive, and the web
reference).

Fixes the docs 3-up misrepresentation where composed molecules/organisms
(ActionPanel, DescriptionList, Feed, GridList, MediaObject, StackedList, FilterPanel,
Drawer) rendered the web atoms on their iOS and Android rows: each now threads its
composed atoms (Card, Avatar, Badge, Button) per platform.

Skin corrections include: NumberInput iOS capsule + neutral glyphs + inset divider;
Slider iOS 37x24 capsule knob and Android M3 Expressive thick-track anatomy; Progress
Android active/track gap + stop indicator and iOS neutral track; ActionSheet iOS 27
single-container capsule-row redesign; Chip Android M3 sizing restored (32dp, 8dp
radius) with the selected-filter checkmark; Toast Android solid inverse-surface
snackbar with legible inverse color roles; Accordion web chevron direction; Carousel
native-idiomatic default (no overlay arrows); DataTable iOS title-case headers and
compact-width column collapse; Drawer iOS 38pt sheet radius, scheme-aware scrim, and M3
1dp elevation; kit-wide iOS SF-Pro tracking, `borderCurve: "continuous"` on iOS rounded
surfaces, Android M3 type roles, ripple-helper routing, and 44pt/48dp minimum touch
targets.

New capabilities: Slider and Progress join the standard field-width axis
(narrow/wide/block); EmptyState `icon` accepts a React element; Button carries a
per-skin minimum touch target.
