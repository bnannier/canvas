import { createSidebar } from "./sidebar.shared.js";
import { iosSkin } from "./sidebar.styles.js";
import { Drawer } from "../drawer/drawer.ios.js";
import { Badge } from "../../atoms/badge/badge.ios.js";
import { Avatar } from "../../atoms/avatar/avatar.ios.js";

// iOS (HIG sidebar) Sidebar. Metro resolves this file on iOS; the docs import it for preview.
export const Sidebar = createSidebar(iosSkin, { Drawer, Badge, Avatar });
export type { SidebarProps, SidebarItem, SidebarSection, SidebarAccount } from "./sidebar.shared.js";
