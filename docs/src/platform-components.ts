// The registry of components that ship platform skins. The docs preview the iOS
// and Android skins by importing the real `.ios`/`.android` files by LITERAL path
// (a bare/barrel import would only ever resolve the web file). Each skinned
// component is one import pair + two lines here; live-scope spreads PLATFORM_OVERRIDES
// into its per-platform eval scope. On a real device, Metro resolves these files
// automatically, so the skins are native, not a docs trick.

import { Switch as SwitchIOS } from "../../src/atoms/switch/switch.ios.js";
import { Switch as SwitchAndroid } from "../../src/atoms/switch/switch.android.js";
import { Button as ButtonIOS } from "../../src/atoms/button/button.ios.js";
import { Button as ButtonAndroid } from "../../src/atoms/button/button.android.js";
import { Checkbox as CheckboxIOS } from "../../src/atoms/checkbox/checkbox.ios.js";
import { Checkbox as CheckboxAndroid } from "../../src/atoms/checkbox/checkbox.android.js";

export const PLATFORM_OVERRIDES: Record<"ios" | "android", Record<string, unknown>> = {
  ios: {
    Switch: SwitchIOS,
    Button: ButtonIOS,
    Checkbox: CheckboxIOS,
  },
  android: {
    Switch: SwitchAndroid,
    Button: ButtonAndroid,
    Checkbox: CheckboxAndroid,
  },
};
