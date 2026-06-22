import { createTabBar } from "./tab-bar.shared.js";
import { androidSkin } from "./tab-bar.styles.js";

// Material 3 TabBar (navigation bar). Metro resolves this file on Android; the docs import it for preview.
export const TabBar = createTabBar(androidSkin);
export type { TabBarProps, TabBarItem } from "./tab-bar.shared.js";
