---
"@nannier/canvas": patch
---

Fix the Android Material ripple bleeding past a control's rounded corners, kit-wide.

A bounded `android_ripple` is installed as the pressable's OWN background drawable, masked to a
rectangle. React Native implements `overflow:"hidden"` as a path-clip applied only in
`ViewGroup.dispatchDraw` (children only) and never enables `clipToOutline`, so a node can never
clip its own ripple: the rectangle bleeds past the rounded corners. Setting `overflow:"hidden"` on
the same node as the ripple (the kit's previous approach across ~20 rounded controls) does nothing
on a real Android device.

New `RippleClip` primitive: a rounded, `overflow:"hidden"` PARENT that wraps a bounded-ripple
pressable so the parent's child-clip rounds the ripple. It is Android-only (no ripple to clip on
iOS/web) and a transparent layout passthrough elsewhere, so node structure and layout are identical
across platforms. Helpers `cornerRadii` (match the child's corners with no hard-coded radius) and
`splitElevation` (keep an elevated card's shadow while its ripple is clipped) ship alongside it. The
same-node `rippleClip()` helper is re-documented for its only correct use — an `overflow` on the
rounded PARENT of ripple rows.

Every rounded, bounded-ripple control now routes its ripple through the correct clip: Button,
ButtonGroup, Chip, Pagination, Stepper, Select, Autocomplete, Listbox rows (left unwrapped — 2px
radius, and a wrapper would break `listbox`/`option`), Navbars, Sidebar, Tabs, Steps, Toast,
Calendar, StackedLists, AlertDialog, Dialog, Stats, Card, MediaObject, CodeBlock, and the menu
surfaces Dropdown, RowMenu, ActionSheet, and FilterPanel.
