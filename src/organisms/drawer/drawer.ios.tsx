import { createDrawer } from "./drawer.shared.js";
import { iosSkin } from "./drawer.styles.js";

// iOS (HIG sheet) Drawer. Metro resolves this file on iOS; the docs import it for preview.
export const Drawer = createDrawer(iosSkin);
export type { DrawerProps } from "./drawer.shared.js";
