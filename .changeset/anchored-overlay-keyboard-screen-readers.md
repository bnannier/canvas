---
"@nannier/canvas": patch
---

Anchored cards keep their place in the keyboard order and are modal to screen readers (the AnchoredOverlay audit turn, AO-1 and AO-2, as the owner decided them). Behaviour changes:

- On the web an open card's controls sit in the tab order right after its trigger. Tab from the card's last control goes on to the control after the trigger instead of the end of the document, Shift+Tab from its first returns to the trigger, and Tab from the trigger enters the card. Focus is never left on the page body with a card open.
- Inside a modal (a Dialog, or any `aria-modal` container) that order is the modal's: Tab past its last control wraps to its first, as the modal's own focus trap does, so leaving a card whose trigger is the modal's last control never reaches the page behind it.
- A focused node in a card that is no tab stop itself (the card's panel, a row the roving stop is not on) moves to the card's own stops on either side of it, as the browser would in flow.
- Menus and option lists (Dropdown, RowMenu, ButtonGroup's split menu, Select, the PhoneInput country list) close on a Tab out of them, and focus goes on in the page's order. Their rows are their one tab stop (the WAI-ARIA menu and listbox patterns): an overflowing list's scrollport is no longer a stop of its own, since a scroller is one only while it holds no focusable child. Popover and Command stay open while Tab moves through and past them.
- Popover's panel is a dialog named by its title (by its trigger's label when it has none) and described by its supporting line.
- RowMenu, ButtonGroup's split menu, Select and the PhoneInput country list now move focus in when they open, as Dropdown already did: the first enabled row of a menu, the selected option of a list. The arrow keys, Home and End move among the rows, and Enter and Space activate one.
- When a card closes, focus it held goes back to what opened it (the trigger, or the control that opened it programmatically). A combobox's field (Autocomplete) keeps focus and is never refocused, so its list does not reopen.
- On iOS and Android every anchored card that can close (menus, option lists, Popover, Command, the Calendar day peek) is modal to VoiceOver and TalkBack while open: the page behind it is hidden from them, a card opened from it covers it, their focus moves into it (the first row, the selected option, Popover's first line, the peek's heading) and returns to the trigger control when it closes. Autocomplete's suggestion list stays non-modal, so its field remains reachable while typing. A card pinned open is not modal.
