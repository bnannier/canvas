import { createDashboardGrid } from "./dashboard-grid.shared.js";
import { webSkin } from "./dashboard-grid.styles.js";

// Web DashboardGrid (the base; Metro falls back to it on native, web bundlers resolve it).
// The composed DragDrop parts default to the web builds inside createDashboardGrid.
export const DashboardGrid = createDashboardGrid(webSkin);
export { clearStoredDashboardOrder } from "./dashboard-grid.shared.js";
export { DASHBOARD_COLUMNS, effectiveSpan, moveWidget, orderedWidgets } from "./dashboard-grid.logic.js";
export type { DashboardGridProps } from "./dashboard-grid.shared.js";
export type { DashboardWidget, DashboardTier } from "./dashboard-grid.logic.js";
