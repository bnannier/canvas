import { createDrawer } from "./drawer.shared.js";
import { androidSkin } from "./drawer.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Material 3 (side/bottom sheet) Drawer. Metro resolves this file on Android; the
// docs import it for preview. The trigger is the Android-styled Button (an M3
// pill) so the docs 3-up shows the native trigger; the literal `.android` import
// is required there, where a barrel import would resolve the web Button.
export const Drawer = createDrawer(androidSkin, ButtonAndroid);
export type { DrawerProps } from "./drawer.shared.js";
