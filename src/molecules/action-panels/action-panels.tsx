import { createActionPanel } from "./action-panels.shared.js";
import { webSkin } from "./action-panels.styles.js";

// Web ActionPanel (the base; Metro falls back to it on native, web bundlers
// resolve it). The action uses the web Button/Switch by default.
export const ActionPanel = createActionPanel(webSkin);
export type { ActionPanelProps } from "./action-panels.shared.js";
