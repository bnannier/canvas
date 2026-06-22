import { createActionPanel } from "./action-panels.shared.js";
import { iosSkin } from "./action-panels.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";
import { Switch as SwitchIOS } from "../../atoms/switch/switch.ios.js";

// iOS (HIG) ActionPanel. Metro resolves this file on iOS; the docs import it for
// preview. The action renders the iOS-styled Button/Switch so it reads native in
// the panel. The literal `.ios` atom imports are required for the WEB docs 3-up,
// where a barrel import would resolve the web atoms inside the iOS row.
export const ActionPanel = createActionPanel(iosSkin, ButtonIOS, SwitchIOS);
export type { ActionPanelProps } from "./action-panels.shared.js";
