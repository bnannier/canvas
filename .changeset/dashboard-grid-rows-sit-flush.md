---
"@nannier-com/canvas": patch
---

DashboardGrid: a board's rows sit flush, and a grown Card fills the box it is given

DashboardGrid laid its cells out with `alignItems: "flex-start"`, so every cell
hugged its own content. That is invisible while the widgets in a row happen to
run the same height and reads as a hole in the board the moment one of them is
short: on the Ionize console's overview, a widget with nothing to draw sat in a
158px tile beside a 427px neighbour, and the 269px underneath it was page
background rather than anything the board had put there. Cells now stretch to
the height of the row they wrapped onto, and the customize-mode chrome (the drag
wrapper and the dashed edit ring) passes that height on, so a tile that fills its
cell keeps filling it while the board is unlocked.

Stretching the CELL is all that changed. The widget inside still sizes itself, so
a board of widgets that hug their content renders exactly as it did before; a
widget that wants the tile's full height now has a box to grow into, which was
not reachable from outside the kit.

`Card`'s `grow` reached the surface alone, which made it the wrong half of that
pair: a card stretched to stand beside a taller neighbour drew its content in a
box it did not fill and left its footer floating in the middle of the surface.
The body section now takes up whatever slack the growth won. This is inert on a
card that is already exactly as tall as its sections, which is every card that
was not asked to grow.
