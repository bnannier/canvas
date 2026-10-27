import { createTabs } from "./tabs.shared.js";
import { iosSkin } from "./tabs.styles.js";

// iOS Tabs: the capsule segmented control (UISegmentedControl). Metro resolves this file on iOS; the docs import it for preview.
export const Tabs = createTabs(iosSkin);
export type { TabsProps, TabItem } from "./tabs.shared.js";
