import { createDrawer } from "./drawer.shared.js";
import { androidSkin } from "./drawer.styles.js";

// Material 3 (side sheet) Drawer. Metro resolves this file on Android; the docs import it for preview.
export const Drawer = createDrawer(androidSkin);
export type { DrawerProps } from "./drawer.shared.js";
