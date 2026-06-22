import { createTabBar } from "./tab-bar.shared.js";
import { iosSkin } from "./tab-bar.styles.js";

// iOS (HIG) TabBar. Metro resolves this file on iOS; the docs import it for preview.
export const TabBar = createTabBar(iosSkin);
export type { TabBarProps, TabBarItem } from "./tab-bar.shared.js";
