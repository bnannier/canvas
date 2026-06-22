// The registry of components that ship platform skins, ported from the web docs'
// platform-components.ts. The WEB docs preview the iOS and Android skins by importing
// the real `.ios`/`.android` files by LITERAL path (a bare/barrel import only ever
// resolves the web file in a browser bundler). This table is used ONLY on the web
// build (see build-scopes.web.tsx); on a real device Metro resolves these files
// automatically by platform extension, so build-scopes.native.tsx never imports it.

import { Switch as SwitchIOS } from "../../../src/atoms/switch/switch.ios.js";
import { Switch as SwitchAndroid } from "../../../src/atoms/switch/switch.android.js";
import { Button as ButtonIOS } from "../../../src/atoms/button/button.ios.js";
import { Button as ButtonAndroid } from "../../../src/atoms/button/button.android.js";
import { Checkbox as CheckboxIOS } from "../../../src/atoms/checkbox/checkbox.ios.js";
import { Checkbox as CheckboxAndroid } from "../../../src/atoms/checkbox/checkbox.android.js";
import { Radio as RadioIOS } from "../../../src/atoms/radio/radio.ios.js";
import { Radio as RadioAndroid } from "../../../src/atoms/radio/radio.android.js";
import { Input as InputIOS } from "../../../src/atoms/input/input.ios.js";
import { Input as InputAndroid } from "../../../src/atoms/input/input.android.js";
import { Textarea as TextareaIOS } from "../../../src/atoms/textarea/textarea.ios.js";
import { Textarea as TextareaAndroid } from "../../../src/atoms/textarea/textarea.android.js";
import { ButtonGroup as ButtonGroupIOS } from "../../../src/atoms/button-group/button-group.ios.js";
import { ButtonGroup as ButtonGroupAndroid } from "../../../src/atoms/button-group/button-group.android.js";
import { Select as SelectIOS } from "../../../src/atoms/select/select.ios.js";
import { Select as SelectAndroid } from "../../../src/atoms/select/select.android.js";
import { Combobox as ComboboxIOS } from "../../../src/atoms/combobox/combobox.ios.js";
import { Combobox as ComboboxAndroid } from "../../../src/atoms/combobox/combobox.android.js";
import { Dropdown as DropdownIOS } from "../../../src/atoms/dropdown/dropdown.ios.js";
import { Dropdown as DropdownAndroid } from "../../../src/atoms/dropdown/dropdown.android.js";
import { Popover as PopoverIOS } from "../../../src/atoms/popover/popover.ios.js";
import { Popover as PopoverAndroid } from "../../../src/atoms/popover/popover.android.js";
import { Tooltip as TooltipIOS } from "../../../src/atoms/tooltip/tooltip.ios.js";
import { Tooltip as TooltipAndroid } from "../../../src/atoms/tooltip/tooltip.android.js";
import { RowMenu as RowMenuIOS } from "../../../src/organisms/row-menu/row-menu.ios.js";
import { RowMenu as RowMenuAndroid } from "../../../src/organisms/row-menu/row-menu.android.js";
import { Dialog as DialogIOS } from "../../../src/organisms/dialog/dialog.ios.js";
import { Dialog as DialogAndroid } from "../../../src/organisms/dialog/dialog.android.js";
import { AlertDialog as AlertDialogIOS } from "../../../src/molecules/alert-dialog/alert-dialog.ios.js";
import { AlertDialog as AlertDialogAndroid } from "../../../src/molecules/alert-dialog/alert-dialog.android.js";
import { Overlay as OverlayIOS } from "../../../src/organisms/overlays/overlays.ios.js";
import { Overlay as OverlayAndroid } from "../../../src/organisms/overlays/overlays.android.js";
import { Spinner as SpinnerIOS } from "../../../src/atoms/spinner/spinner.ios.js";
import { Spinner as SpinnerAndroid } from "../../../src/atoms/spinner/spinner.android.js";
import { Tabs as TabsIOS } from "../../../src/organisms/tabs/tabs.ios.js";
import { Tabs as TabsAndroid } from "../../../src/organisms/tabs/tabs.android.js";
import { Pagination as PaginationIOS } from "../../../src/atoms/pagination/pagination.ios.js";
import { Pagination as PaginationAndroid } from "../../../src/atoms/pagination/pagination.android.js";
import { Stepper as StepperIOS } from "../../../src/organisms/stepper/stepper.ios.js";
import { Stepper as StepperAndroid } from "../../../src/organisms/stepper/stepper.android.js";
import { Navbar as NavbarIOS } from "../../../src/organisms/navbars/navbars.ios.js";
import { Navbar as NavbarAndroid } from "../../../src/organisms/navbars/navbars.android.js";
import { Sidebar as SidebarIOS } from "../../../src/organisms/sidebar/sidebar.ios.js";
import { Sidebar as SidebarAndroid } from "../../../src/organisms/sidebar/sidebar.android.js";
import { Calendar as CalendarIOS } from "../../../src/organisms/calendar/calendar.ios.js";
import { Calendar as CalendarAndroid } from "../../../src/organisms/calendar/calendar.android.js";
import { Badge as BadgeIOS } from "../../../src/atoms/badge/badge.ios.js";
import { Badge as BadgeAndroid } from "../../../src/atoms/badge/badge.android.js";

export const PLATFORM_SKINS: Record<"ios" | "android", Record<string, unknown>> = {
  ios: {
    Switch: SwitchIOS, Button: ButtonIOS, Checkbox: CheckboxIOS, Radio: RadioIOS,
    Input: InputIOS, Textarea: TextareaIOS, ButtonGroup: ButtonGroupIOS, Select: SelectIOS,
    Combobox: ComboboxIOS, Dropdown: DropdownIOS, Popover: PopoverIOS, Tooltip: TooltipIOS,
    RowMenu: RowMenuIOS, Dialog: DialogIOS, AlertDialog: AlertDialogIOS, Overlay: OverlayIOS,
    Spinner: SpinnerIOS, Tabs: TabsIOS, Pagination: PaginationIOS, Stepper: StepperIOS,
    Navbar: NavbarIOS, Sidebar: SidebarIOS, Calendar: CalendarIOS, Badge: BadgeIOS,
  },
  android: {
    Switch: SwitchAndroid, Button: ButtonAndroid, Checkbox: CheckboxAndroid, Radio: RadioAndroid,
    Input: InputAndroid, Textarea: TextareaAndroid, ButtonGroup: ButtonGroupAndroid, Select: SelectAndroid,
    Combobox: ComboboxAndroid, Dropdown: DropdownAndroid, Popover: PopoverAndroid, Tooltip: TooltipAndroid,
    RowMenu: RowMenuAndroid, Dialog: DialogAndroid, AlertDialog: AlertDialogAndroid, Overlay: OverlayAndroid,
    Spinner: SpinnerAndroid, Tabs: TabsAndroid, Pagination: PaginationAndroid, Stepper: StepperAndroid,
    Navbar: NavbarAndroid, Sidebar: SidebarAndroid, Calendar: CalendarAndroid, Badge: BadgeAndroid,
  },
};
