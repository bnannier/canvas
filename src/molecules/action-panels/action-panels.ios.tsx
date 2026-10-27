import { createActionPanel } from "./action-panels.shared.js";
import { iosSkin } from "./action-panels.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";
import { Switch as SwitchIOS } from "../../atoms/switch/switch.ios.js";

// iOS ActionPanel. Metro resolves this file on iOS; the docs import it for preview. iOS
// ships no action panel, so the panel is the hand-off's (in SF Pro), and the action is
// the iOS Button / Switch. The literal `.ios` atom imports are required for the WEB docs
// 3-up, where a barrel import would resolve the web atoms inside the iOS row.
export const ActionPanel = createActionPanel(iosSkin, ButtonIOS, SwitchIOS);
export type { ActionPanelProps } from "./action-panels.shared.js";
