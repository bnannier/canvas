import { createFilterPanel } from "./filter-panel.shared.js";
import { androidSkin } from "./filter-panel.styles.js";
import { CheckboxIndicator as CheckboxAndroid } from "../../atoms/checkbox/indicator/index.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import { Drawer as DrawerAndroid } from "../drawer/drawer.android.js";

// Android FilterPanel. Metro resolves this file on Android; the docs import it for
// preview. The option rows lead with the Material 3 Checkbox, and the header Clear action
// and the drawer trigger are the Android Buttons. The literal `.android` atom imports are
// required for the WEB docs 3-up, where a barrel import would resolve the web atoms.
export const FilterPanel = createFilterPanel(androidSkin, { CheckboxVisual: CheckboxAndroid, Button: ButtonAndroid, Drawer: DrawerAndroid });
export type { FilterPanelProps, FilterOption, FilterGroup } from "./filter-panel.shared.js";
