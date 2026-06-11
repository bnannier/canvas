import { createSidebar } from "./sidebar.shared.js";
import { iosSkin } from "./sidebar.styles.js";

// iOS (HIG sidebar) Sidebar. Metro resolves this file on iOS; the docs import it for preview.
export const Sidebar = createSidebar(iosSkin);
export type { SidebarProps, SidebarItem, SidebarSection } from "./sidebar.shared.js";
