---
"@olympusoss/canvas": minor
---

Add platform-adaptive skins: every high-identity control, nav, overlay, and picker now
renders with a native iOS (Apple HIG) / Android (Material 3) / Web look.

Canvas is platform-forward: the brand (the indigo `primary` and the type) survives on every
platform; only the native shape, sizing, structure, and interaction feedback change per OS.
Each skinned component splits into a shared shell plus a co-located skin per platform:
`<name>.shared.tsx` (structure + behavior + a `<Name>Skin` interface) +
`<name>.styles.ts` (`iosSkin` / `androidSkin` / `webSkin`) + thin `<name>.ios.tsx` /
`<name>.android.tsx` / `<name>.tsx`. Metro resolves the `.ios`/`.android` files on device, so
the skins are native (not a docs trick); the web look is unchanged.

23 components skinned: button, checkbox, radio, switch, input, textarea, button-group, select,
combobox, dropdown, row-menu, popover, tooltip, dialog, alert-dialog, overlays, spinner, tabs,
pagination, stepper, navbar, sidebar, calendar. Highlights: iOS opacity-dim press vs Android
`android_ripple`; iOS rounded-rect / segmented controls vs Material 3 pill / underline; iOS
UIAlertController vs M3 dialog; iOS spoke spinner vs M3 sweeping arc; iOS rounded-popover menus
vs M3 elevated menus; iOS date picker (2-letter weekdays, colored today) vs M3 date picker
(1-letter weekdays, outlined-ring today).

The public boolean-prop API and every behavior are unchanged; this is purely additive (new
per-platform files + co-located skins), and web rendering stays byte-for-byte the same.
