---
"@nannier/canvas": patch
---

Grabbing a card by keyboard inside a horizontal `DropZone` now starts the cursor
at the card's left-to-right position instead of a position read down the wrong
axis.

`startKeyboardDrag` sorted the source zone's measured cards along the VERTICAL
axis unconditionally, even when that zone was registered `horizontal`. Ranking a
row's cards by their top edge says nothing about the order it reads in: cards of
unequal height rank by how they sit on the cross axis rather than left to right,
and a row whose tops all agree is a pile of ties that resolves to whatever order
the measurement pass happened to build. The cursor therefore opened on the wrong
card, announced the wrong position, and dropped at the wrong index. Everything
else in the drag layer already read the zone's own `horizontal` flag through
`zoneCards`, so the pointer path and the insertion indicator were never affected,
which again left the accessible path as the broken one.

The starting index now reads that same flag, so both paths agree on one axis per
zone. No kit component reached this: DashboardGrid's horizontal zones hold a
single card each and Board's lanes are vertical, so the fix lands for consumers
composing a horizontal `DropZone` with several `Draggable`s of their own.
