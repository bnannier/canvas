import { createTabBar } from "./tab-bar.shared.js";
import { webSkin } from "./tab-bar.styles.js";

// Web TabBar (the base; Metro falls back to it on native, web bundlers resolve it).
/** Bottom app navigation: equal-width destinations, each an icon over a short label, one active. */
export const TabBar = createTabBar(webSkin);
export type { TabBarProps, TabBarItem } from "./tab-bar.shared.js";
