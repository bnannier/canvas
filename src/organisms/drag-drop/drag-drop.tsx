import { createDragDrop } from "./drag-drop.shared.js";
import { webSkin } from "./drag-drop.styles.js";

// Web DragDrop (the base; Metro falls back to it on native, web bundlers resolve it). All four
// members come from ONE createDragDrop call so they share the same internal React context,
// exported member by member so each carries its own summary (a destructured export reaches
// the published declarations without one).
const dragDrop = createDragDrop(webSkin);
/**
 * The drag and drop context: wrap a surface in it, then mark DropZone regions and
 * Draggable items.
 */
export const DragDropProvider = dragDrop.DragDropProvider;
/** A region of a DragDropProvider that accepts dropped items. */
export const DropZone = dragDrop.DropZone;
/** An item that can be dragged between DropZone regions, by pointer or keyboard. */
export const Draggable = dragDrop.Draggable;
/** The grip that starts dragging its Draggable. */
export const DragHandle = dragDrop.DragHandle;
export type { DropEvent, DragDropProviderProps, DropZoneProps, DraggableProps, DragHandleProps } from "./drag-drop.shared.js";
