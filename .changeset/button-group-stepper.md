---
"@olympusoss/canvas": minor
---

ButtonGroup: add the `stepper` kind (and Icon left/right chevrons)

`<ButtonGroup stepper items={[...]} />` is a prev / current / next control. The
chevrons are built into the component and `items` is the list it cycles through
(wrapping at the ends); the middle label tracks the position. It is uncontrolled
from the initial `active` index and reports each step through `onSelect`. Use it
for stepping an ordered set (dates, pages, zoom levels).

Adds `chevronLeft` and `chevronRight` glyphs to Icon, which the stepper uses.
