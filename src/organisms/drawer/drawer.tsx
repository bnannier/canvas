import { createDrawer } from "./drawer.shared.js";
import { webSkin } from "./drawer.styles.js";

// Web Drawer (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A panel that slides in from an edge over the whole app: a navigation drawer, a menu or a
 * bottom sheet.
 */
export const Drawer = createDrawer(webSkin);
export type { DrawerProps } from "./drawer.shared.js";
