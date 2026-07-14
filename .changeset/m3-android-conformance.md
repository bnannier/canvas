---
"@nannier/canvas": patch
---

Material 3 conformance corrections across the Android skins, from a full visual audit
of every Android-skinned component against the m3.material.io spec (web preview plus a
real-device pass on a Pixel emulator):

- Switch: Android track is now the M3 52x32dp with a 16dp unselected and 24dp selected
  handle (was 48x28 with an ~11dp handle).
- Chip: the Android chip is now the M3 8dp rounded rectangle, 32dp tall (was a full
  pill ~26dp). iOS and web keep the pill.
- Toast: the Android snackbar now uses the M3 inverse surface (a dark capsule with
  light text in a light theme, light in dark) at the 4dp radius, instead of the normal
  theme surface.
- Alert dialog: the Android destructive action is now an M3 text button in the error
  color, not a filled red button; both actions are right-aligned text buttons.
- Row menu: a `separatorBefore` item now renders its divider on Android (a dead
  internal flag had suppressed it).
- Tab bar: the Android navigation bar now shows the M3 active-indicator pill (56x32dp
  tonal, centered behind the active icon on native and web alike).
- Navbars: the Android top app bar is now 64dp (M3 Small), up from the Material 2 56dp.
- Empty state: the Android action button now renders the correct per-OS Button (the
  M3 filled pill) instead of the web button, by threading a per-OS Button like Form.
- Accordion and Collapsible: the Android disclosure chevron now uses the Material
  convention (down at rest, rotating up when open); iOS and web keep the right chevron.
- Carousel: the Android slide corner radius is now the M3 28dp (was 16dp).
- Chip and IconTile are now registered in the docs platform preview so their real
  Android skins are shown.

iOS and web appearances are unchanged. A known Android-only checkbox layout bug (the
box collapses horizontally on native) is tracked separately for a dedicated fix.
