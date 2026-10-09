import { createSidebar } from "./sidebar.shared.js";
import { webSkin } from "./sidebar.styles.js";

// Web Sidebar (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * An app navigation rail with collapsible sections and one active item; with `responsive`
 * it becomes a drill-down menu on a phone.
 */
export const Sidebar = createSidebar(webSkin);
export type { SidebarProps, SidebarItem, SidebarSection } from "./sidebar.shared.js";
