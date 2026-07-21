import { createDragDrop } from "./drag-drop.shared.js";
import { webSkin } from "./drag-drop.styles.js";

// Web DragDrop (the base; Metro falls back to it on native, web bundlers resolve it). All four
// members come from ONE createDragDrop call so they share the same internal React context.
export const { DragDropProvider, DropZone, Draggable, DragHandle } = createDragDrop(webSkin);
export type { DropEvent, DragDropProviderProps, DropZoneProps, DraggableProps, DragHandleProps } from "./drag-drop.shared.js";
