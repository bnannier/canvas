---
"@nannier/canvas": patch
---

The shape table is the one source for a corner that plays a role. `shape.ios.checkbox` changes from 5 to 9999: the iOS checkbox has always drawn the edit-mode selection circle, and no surface ever drew 5; the iOS checkbox renders the same circle as before. DESIGN.md's Shapes section now lists every role per platform, the roles only one platform draws, and the components that draw each role.

The CSS hand-off (`styles/tokens/platforms.css`) follows the skins:

- iOS `--p-check-radius` 11px to 9999px (the same circle on the 22px box).
- `--p-overlay-radius` and `--p-sheet-radius` from a stale 12px to the dialog and sheet corners: 28px and 38px on iOS, 28px and 28px on Android.
- The rendered changes listed in the corner changeset: `--p-select-row-radius` and `--p-ac-row-radius` 10px to 8px, `--p-stepper-group-radius` 6px to 10px, `--p-emblem-radius-small` and `--p-swatch-radius-small` 10px to 12px, `--p-emblem-radius-large` and `--p-swatch-radius-large` 14px to 12px; on iOS `--p-table-radius`, `--p-media-radius` and `--p-grid-gallery-radius` 10px to 12px, `--p-cmd-radius` 16px to 12px, `--p-alert-btn-radius` 22px to 9999px; on Android `--p-cmd-radius` 8px to 12px and `--p-table-radius` 8px to 12px.
- Equivalent spellings of the same capsule: the web `--p-slider-track-radius`, `--p-slider-inner-radius` and `--p-slider-thumb-radius` 999px to 9999px; iOS `--p-ad-btn-radius` 999px to 9999px; Android `--p-alert-btn-radius` and `--p-ad-btn-radius` 20px to 9999px and `--p-drag-handle-radius` 20px to 9999px (each on a box twice that tall, so the same capsule or circle).
