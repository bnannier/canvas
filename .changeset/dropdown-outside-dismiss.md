---
"@olympusoss/canvas": minor
---

Dropdown now dismisses on an outside click on the web. While an uncontrolled
Dropdown is open it lays down a transparent full-viewport backdrop, so pressing
anywhere off the menu closes it, matching standard dropdown behavior (it already
closed on re-pressing the trigger or selecting an item). A controlled (`open`)
Dropdown gets no backdrop, so a deliberately-pinned menu is never dismissed and
never traps page clicks; native is unchanged (the inline menu has no portal there,
it would use a Modal).
