---
"@nannier/canvas": minor
---

Minor, for three user-visible capabilities (the owner's P3e and AO-6 decisions):

- AnchoredOverlay gains a placement preference: `above` places the card above its trigger, and `besideStart` / `besideEnd` place it beside the trigger at its leading or trailing side, each flipping to the other side and then to above or below when the preferred side lacks room. `preferSide` keeps working as the old name of `besideEnd`, which now means the trailing side first in the layout direction. `useOverlaySide` reports the side a card took, `start` and `end` included, so a decoration aims the right way.
- Popover's `top` now anchors the card above its trigger (it used to anchor below and only move the iOS beak). Either placement flips to the other side when its own lacks room, and the iOS beak follows the side the card took.
- At the phone form factor a Popover that can close is presented as a sheet on the bottom edge of the window, over the app's tab bar and a dimming scrim, across the window's width (up to 640) with its content kept clear of the home indicator: Dark Factory's sheet on the web, the iOS sheet on iPhone and the Material 3 bottom sheet on Android. Under glass the sheet takes the dense layer, so its text keeps 4.5:1 over the dimmed page the frost samples and the covered tab bar does not read through it. AnchoredOverlay offers it through its new `sheetStyle`. Menus, Select and Autocomplete stay anchored; Command and PhoneInput's country list adopt the sheet in their own audit turns.
