import { createDashboardGrid } from "./dashboard-grid.shared.js";
import { iosSkin } from "./dashboard-grid.styles.js";
import {
  DragDropProvider as DragDropProviderIOS,
  DropZone as DropZoneIOS,
  Draggable as DraggableIOS,
  DragHandle as DragHandleIOS,
} from "../drag-drop/drag-drop.ios.js";

// iOS DashboardGrid. Metro resolves this file on iOS; the docs import it for preview. The
// layout skin is shared by design (see dashboard-grid.styles.ts), so what makes this build
// iOS is the composed DragDrop family: the grip, the lifted ghost, and the insertion
// indicator all read native. The literal `.ios` imports are required for the WEB docs 3-up,
// where a barrel import would resolve the web builds.
export const DashboardGrid = createDashboardGrid(iosSkin, {
  DragDropProvider: DragDropProviderIOS,
  DropZone: DropZoneIOS,
  Draggable: DraggableIOS,
  DragHandle: DragHandleIOS,
});
export { clearStoredDashboardOrder } from "./dashboard-grid.shared.js";
export { DASHBOARD_COLUMNS, effectiveSpan, moveWidget, orderedWidgets } from "./dashboard-grid.logic.js";
export type { DashboardGridProps } from "./dashboard-grid.shared.js";
export type { DashboardWidget, DashboardTier } from "./dashboard-grid.logic.js";
