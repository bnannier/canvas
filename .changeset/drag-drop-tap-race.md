---
"@nannier/canvas": patch
---

DragDrop: never arm a pointer drag whose grip was already released. Arming is
async (the zone/card measure spans a few macrotasks), so a grip tapped, or
dragged and released, before the measure landed would arm a drag no pointer
owned and leave the drop ring and source dim stuck until the next interaction.
A per-grab session guard now invalidates any measure that finishes after
release or after a newer grab.
