import { createTabs } from "./tabs.shared.js";
import { webSkin } from "./tabs.styles.js";

// Web Tabs (the base; Metro falls back to it on native, web bundlers resolve it).
export const Tabs = createTabs(webSkin);
export type { TabsProps, TabItem } from "./tabs.shared.js";
