---
"@nannier/canvas": patch
---

Drag & drop now reads in the layout direction: a `horizontal` DropZone mirrors
under RTL, and the two horizontal arrows swap roles.

The geometry had no direction handling at all. `insertionIndexFor` treated a
larger X as a later data index, so a pointer dropped visually to the RIGHT of a
target in a right-to-left locale resolved to "after" in data order, which renders
to its LEFT; `zonesInReadingOrder` sorted each row by ascending X, the reverse of
how the zones actually read. The two agreed with each other, so the keyboard
cursor was consistently wrong rather than inconsistently wrong.

The axis is now mirrored, following how the rest of the kit resolves direction:
`flexDirection: "row"` mirrors under RTL, so data index 0 is the RIGHTMOST card
and "later in data order" means further left. `sortByMainAxis` returns the row in
data order (descending X under RTL), `insertionIndexFor` counts the midpoints the
pointer has passed along the reading direction, and `zonesInReadingOrder`
reverses only the within-row sweep (rows still run top to bottom, because the
block axis never mirrors). Vertical zones and the up/down arrows are unchanged in
both directions.

`insertionOffset` now measures from the zone's LEADING edge along the reading
axis, and the horizontal indicator anchors with the logical `insetInlineStart`
rather than a physical `left`, so the line meets the correct edge of a mirrored
row on every platform with no branch. In a left-to-right layout that resolves to
the same `left` inset as before, so nothing about the existing look changes.

ArrowLeft and ArrowRight swap roles under RTL (Right Arrow moves to the previous
item, per the WAI-ARIA practices), the same flip `useRovingFocus` applies to a
tablist and the Slider applies to its step. The keyboard cursor's opening
position, which already reads a `horizontal` zone along its own axis, now reads
that axis in the layout direction too.

Direction reaches the geometry as a parameter, never a global read: the shell
reads `isRTL()` and hands the answer in, which keeps the whole module unit-
testable with no renderer.
