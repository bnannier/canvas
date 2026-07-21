import { createDragDrop } from "./drag-drop.shared.js";
import { iosSkin } from "./drag-drop.styles.js";

// iOS (HIG) DragDrop. Metro resolves this file on iOS; the docs import it for preview.
export const { DragDropProvider, DropZone, Draggable, DragHandle } = createDragDrop(iosSkin);
export type { DropEvent, DragDropProviderProps, DropZoneProps, DraggableProps, DragHandleProps } from "./drag-drop.shared.js";
