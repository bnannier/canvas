---
"@nannier/canvas": patch
---

VoiceOver and TalkBack now land where an open anchored card says they do (the AnchoredOverlay audit turn's device check of AO-2). Behaviour changes:

- On Android, TalkBack moves into a menu, an option list, a popover, the command palette or the Calendar day peek when it opens, and back to the control that opened it when it closes, by Back, a selection, an outside tap or the escape gesture. The kit sent Android's `focus` accessibility event, which TalkBack takes as a report of input focus and ignores from a view that holds none, so nothing moved it: it seated its own focus on the first node of the window as a card opened (a section label above a menu's first item, a whole option list) and on the screen's header as it closed. It now sends `viewHoverEnter`, the event TalkBack's explore by touch moves on. VoiceOver keeps `focus`.
- An option list opens scrolled to the row focus enters at, on every platform: Select's and the PhoneInput country list's selected option far down the list was focused out of view (on the web its scrollport stayed at the top), and TalkBack, which cannot move to a node off the screen, fell back to the whole list.
- Command's search field takes the input focus when the palette opens on iOS and Android, a frame after it is revealed, with the screen reader moved to it. React Native runs a focus command ahead of the mount of the batch it arrives in, so the field was focused before it was in the window and kept no focus on Android.
- A text field inside a card gives the input focus up natively as the card closes. Android handed the focus of a field removed while it held it to the first view of the window that takes focus by touch (a selectable text, another field), and TalkBack followed it there.
- When a close hands the input focus to a field (PhoneInput's pick gives it to the number), VoiceOver and TalkBack follow it there rather than going back to the trigger, as the web's focus does.
