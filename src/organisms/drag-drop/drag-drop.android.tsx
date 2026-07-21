import { createDragDrop } from "./drag-drop.shared.js";
import { androidSkin } from "./drag-drop.styles.js";

// Android (Material 3) DragDrop. Metro resolves this file on Android; the docs import it for preview.
export const { DragDropProvider, DropZone, Draggable, DragHandle } = createDragDrop(androidSkin);
export type { DropEvent, DragDropProviderProps, DropZoneProps, DraggableProps, DragHandleProps } from "./drag-drop.shared.js";
