import { createActionPanel } from "./action-panels.shared.js";
import { androidSkin } from "./action-panels.styles.js";
import { Card as CardAndroid } from "../card/card.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import { Switch as SwitchAndroid } from "../../atoms/switch/switch.android.js";

// Material 3 ActionPanel. Metro resolves this file on Android; the docs import it
// for preview. The surface renders the M3 Card (12dp radius, elevation-1, 16dp
// padding) and the action the Material 3 Button/Switch so the panel reads native
// (M3 shape + android_ripple). The literal `.android` atom imports are required
// for the WEB docs 3-up, where a barrel import would resolve the web atoms inside
// the Android row.
export const ActionPanel = createActionPanel(androidSkin, ButtonAndroid, SwitchAndroid, CardAndroid);
export type { ActionPanelProps } from "./action-panels.shared.js";
