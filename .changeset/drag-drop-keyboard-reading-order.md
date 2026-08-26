---
"@nannier/canvas": patch
---

Keyboard reordering now follows the arrangement on screen, so a second move on
an already-reordered DashboardGrid goes the way the arrow key points.

The drag layer's keyboard cursor walked the zone REGISTRY, which is mount order
and never changes again: React reuses a keyed DropZone when the board reorders,
so nothing re-registers. From the second keyboard reorder onward, the cursor
therefore stepped to whichever zone had mounted next rather than to the one
beside the widget on screen, and the widget landed somewhere the user did not
ask for. The pointer path was never affected, because it hit-tests the measured
rects, which meant the broken path was the accessible one.

The measurement pass already measures every zone's rect at grab time, so the
cursor now sorts those rects into reading order (row by row, left to right;
`zonesInReadingOrder` in `drag-drop.geometry.ts`) and walks that instead. Rows
are swept rather than bucketed by a tolerance, so lanes of very different heights
still read as one row, and an unmeasured board degrades to the order it was given.
Zone hit-testing keeps using registration order, which is paint order: that is
what decides the top-most zone when two overlap.

Board carried the same latent bug (a consumer that reorders its `columns` moved
the lanes without re-registering them) and is fixed by the same change.
