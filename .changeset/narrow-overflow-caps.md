---
"@nannier/canvas": patch
---

Fix fixed-width surfaces overflowing narrow containers (phone screens).

- AnchoredOverlay now clamps a width-aware card to its outlet: when the outlet
  is narrower than the card plus its edge insets, the card renders at outlet
  width minus the insets instead of running off-screen. Popover passes its card
  width through (new `cardWidth` field on `PopoverSkin`), so popover cards and
  the calendar peek both fit phone-width outlets; the popover skins also carry
  `maxWidth:"100%"` for the inline mode.
- FilterPanel's fixed panel (280 web/iOS, 256 Android) and the Sidebar rail
  (240) gain `maxWidth:"100%"`, so they shrink inside narrower parents.
- Vertical Tabs' fixed 180px rail now flexes down (96px floor, never past 40%
  of the row) and its labels truncate to one line, keeping the panel usable in
  narrow containers.
