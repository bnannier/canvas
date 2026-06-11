import { createTabs } from "./tabs.shared.js";
import { androidSkin } from "./tabs.styles.js";

// Material 3 (underline tabs) Tabs. Metro resolves this file on Android; the docs import it for preview.
export const Tabs = createTabs(androidSkin);
export type { TabsProps, TabItem } from "./tabs.shared.js";
