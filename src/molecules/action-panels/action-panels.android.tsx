import { createActionPanel } from "./action-panels.shared.js";
import { androidSkin } from "./action-panels.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import { Switch as SwitchAndroid } from "../../atoms/switch/switch.android.js";

// Material 3 ActionPanel. Metro resolves this file on Android; the docs import it
// for preview. The action renders the Material 3 Button/Switch so it reads native
// in the panel (M3 shape + android_ripple). The literal `.android` atom imports
// are required for the WEB docs 3-up, where a barrel import would resolve the web
// atoms inside the Android row.
export const ActionPanel = createActionPanel(androidSkin, ButtonAndroid, SwitchAndroid);
export type { ActionPanelProps } from "./action-panels.shared.js";
