import { createDrawer } from "./drawer.shared.js";
import { iosSkin } from "./drawer.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (iOS 27 kit Sheets) Drawer. Metro resolves this file on iOS; the docs import
// it for preview. The trigger is the iOS-styled Button (a ~44pt capsule) so the
// docs 3-up shows the native trigger; the literal `.ios` import is required there,
// where a barrel import would resolve the web Button.
export const Drawer = createDrawer(iosSkin, ButtonIOS);
export type { DrawerProps } from "./drawer.shared.js";
