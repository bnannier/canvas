---
"@nannier/canvas": minor
---

Minor justification: two new user-visible capabilities ship on the public API.

New `Board` organism: a data-driven kanban board composed from the kit's own
DragDropProvider/DropZone/Draggable/DragHandle plus Card, Badge, and RowMenu.
Columns scroll horizontally and are drop zones; cards carry a drag grip, an
optional trailing badge, a 2-line muted description, a free-form `chips` slot,
and an optional kebab menu. Works controlled (`items` + `onMove`, with
`applyBoardMove` exported as the standard reducer and `BoardMove` reporting the
insertion index plus `afterId`/`beforeId` neighbors) or uncontrolled
(`defaultItems` + `onItemsChange`). Keyboard and screen-reader drag come from
the DnD family (Space grabs, arrows move, Space drops, Escape cancels).

`StackedList` gains `reorderable` + `onReorder` (rows get a leading drag grip
and the list becomes a drop zone; order stays controlled by the consumer's
items array) and a per-item `trailing` ReactNode slot rendered before the
badge/meta cluster for inline controls. A bare StackedList renders exactly as
before.

Also: `DragHandle` now refuses pan-responder termination mid-drag, so a
surrounding ScrollView (a board's lanes, a scrollable page) can no longer
steal an in-flight drag on native.
