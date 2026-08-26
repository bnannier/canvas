---
"@nannier/canvas": patch
---

`DashboardWidget.title` is documented for what it actually is: the widget's
accessible name, not a header the grid paints.

It was described as "Widget header label", which promised chrome that has never
existed. Cells render bare on purpose (a widget arrives with its own surface, so
a second heading would double up), and the field is what customize mode uses to
name the widget's drag grip and its drop zone, which is what the drag
announcements read out. Locked, nothing reads it at all, though it stays required
because the board can be unlocked at any time.

Documentation only: the behaviour was right and is unchanged, so no board looks
or acts differently. The `.md` gains a Do/Don't pair teaching it, since a slug or
placeholder title costs nothing visually and leaves keyboard and screen-reader
users dragging "widget-2" around.
