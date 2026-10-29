import { createSidebar } from "./sidebar.shared.js";
import { androidSkin } from "./sidebar.styles.js";
import { Drawer } from "../drawer/drawer.android.js";
import { Badge } from "../../atoms/badge/badge.android.js";
import { Avatar } from "../../atoms/avatar/avatar.android.js";

// Material 3 (navigation drawer) Sidebar. Metro resolves this file on Android; the docs import it for preview.
export const Sidebar = createSidebar(androidSkin, { Drawer, Badge, Avatar });
export type { SidebarProps, SidebarItem, SidebarSection, SidebarAccount } from "./sidebar.shared.js";
