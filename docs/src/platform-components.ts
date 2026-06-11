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
import { Radio as RadioIOS } from "../../src/atoms/radio/radio.ios.js";
import { Radio as RadioAndroid } from "../../src/atoms/radio/radio.android.js";
import { Input as InputIOS } from "../../src/atoms/input/input.ios.js";
import { Input as InputAndroid } from "../../src/atoms/input/input.android.js";
import { Textarea as TextareaIOS } from "../../src/atoms/textarea/textarea.ios.js";
import { Textarea as TextareaAndroid } from "../../src/atoms/textarea/textarea.android.js";
import { ButtonGroup as ButtonGroupIOS } from "../../src/atoms/button-group/button-group.ios.js";
import { ButtonGroup as ButtonGroupAndroid } from "../../src/atoms/button-group/button-group.android.js";
import { Select as SelectIOS } from "../../src/atoms/select/select.ios.js";
import { Select as SelectAndroid } from "../../src/atoms/select/select.android.js";
import { Combobox as ComboboxIOS } from "../../src/atoms/combobox/combobox.ios.js";
import { Combobox as ComboboxAndroid } from "../../src/atoms/combobox/combobox.android.js";
import { Dropdown as DropdownIOS } from "../../src/atoms/dropdown/dropdown.ios.js";
import { Dropdown as DropdownAndroid } from "../../src/atoms/dropdown/dropdown.android.js";
import { Popover as PopoverIOS } from "../../src/atoms/popover/popover.ios.js";
import { Popover as PopoverAndroid } from "../../src/atoms/popover/popover.android.js";
import { Tooltip as TooltipIOS } from "../../src/atoms/tooltip/tooltip.ios.js";
import { Tooltip as TooltipAndroid } from "../../src/atoms/tooltip/tooltip.android.js";
import { RowMenu as RowMenuIOS } from "../../src/organisms/row-menu/row-menu.ios.js";
import { RowMenu as RowMenuAndroid } from "../../src/organisms/row-menu/row-menu.android.js";

export const PLATFORM_OVERRIDES: Record<"ios" | "android", Record<string, unknown>> = {
  ios: {
    Switch: SwitchIOS,
    Button: ButtonIOS,
    Checkbox: CheckboxIOS,
    Radio: RadioIOS,
    Input: InputIOS,
    Textarea: TextareaIOS,
    ButtonGroup: ButtonGroupIOS,
    Select: SelectIOS,
    Combobox: ComboboxIOS,
    Dropdown: DropdownIOS,
    Popover: PopoverIOS,
    Tooltip: TooltipIOS,
    RowMenu: RowMenuIOS,
  },
  android: {
    Switch: SwitchAndroid,
    Button: ButtonAndroid,
    Checkbox: CheckboxAndroid,
    Radio: RadioAndroid,
    Input: InputAndroid,
    Textarea: TextareaAndroid,
    ButtonGroup: ButtonGroupAndroid,
    Select: SelectAndroid,
    Combobox: ComboboxAndroid,
    Dropdown: DropdownAndroid,
    Popover: PopoverAndroid,
    Tooltip: TooltipAndroid,
    RowMenu: RowMenuAndroid,
  },
};
