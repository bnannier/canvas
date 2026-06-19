---
"@olympusoss/canvas": minor
---

Raise iOS skin fidelity to the Apple iOS 27 UI Kit across the kit's iOS-skinned components. Verified component by component on the 3-up preview (light and dark); web and Android skins are unchanged.

Atoms:
- Button: link buttons drop the underline on iOS (web keeps it); a clearer height ladder (base ~50pt, large ~58pt); disabled alpha 0.4.
- Switch: the knob is now a capsule (was a circle), the tracks match the iOS ~1.64 pill, and the off-track is systemGray3 (the old token read as washed-out in light mode).
- Input and Textarea: a focused field no longer paints the react-native-web focus-outline box (only the bottom hairline reacts); the caret is brand indigo.
- Select and Combobox: iOS-native type scale, a leading checkmark with a neutral press tint, 17pt menu rows with hairline separators, disabled alpha 0.4; Combobox is aligned to the Select menu.
- Button Group: the iOS split button is a full capsule (was a rounded rect).
- Pagination: inactive cells and chevrons are transparent (were a near-black fill in dark mode).
- Popover: the anchor is a tapered beak welded to the card edge (was a rotated square).

Organisms and alert-dialog:
- Alert Dialog: the destructive confirm is a gray capsule with a red label (was a red-filled capsule); the confirmation input is the iOS hairline field.
- Calendar: uppercase weekday headers.
- Tabs: a clearer dark-mode selected pill.
- Navbars, Sidebar, Calendar, and Tabs: the stray react-native-web keyboard focus ring no longer shows on iOS controls.
