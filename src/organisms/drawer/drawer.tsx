import { createDrawer } from "./drawer.shared.js";
import { webSkin } from "./drawer.styles.js";

// Web Drawer (the base; Metro falls back to it on native, web bundlers resolve it).
export const Drawer = createDrawer(webSkin);
export type { DrawerProps } from "./drawer.shared.js";
