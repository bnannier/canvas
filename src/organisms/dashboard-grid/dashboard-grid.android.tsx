import { createDashboardGrid } from "./dashboard-grid.shared.js";
import { androidSkin } from "./dashboard-grid.styles.js";
import {
  DragDropProvider as DragDropProviderAndroid,
  DropZone as DropZoneAndroid,
  Draggable as DraggableAndroid,
  DragHandle as DragHandleAndroid,
} from "../drag-drop/drag-drop.android.js";

// Android DashboardGrid. Metro resolves this file on Android; the docs import it for
// preview. The layout skin is shared by design (see dashboard-grid.styles.ts), so what makes
// this build Android is the composed DragDrop family: the grip, the lifted ghost, and the
// insertion indicator all read Material. The literal `.android` imports are required for the
// WEB docs 3-up, where a barrel import would resolve the web builds.
export const DashboardGrid = createDashboardGrid(androidSkin, {
  DragDropProvider: DragDropProviderAndroid,
  DropZone: DropZoneAndroid,
  Draggable: DraggableAndroid,
  DragHandle: DragHandleAndroid,
});
export { clearStoredDashboardOrder } from "./dashboard-grid.shared.js";
export { DASHBOARD_COLUMNS, effectiveSpan, moveWidget, orderedWidgets } from "./dashboard-grid.logic.js";
export type { DashboardGridProps } from "./dashboard-grid.shared.js";
export type { DashboardWidget, DashboardTier } from "./dashboard-grid.logic.js";
