import { createFilterPanel } from "./filter-panel.shared.js";
import { iosSkin } from "./filter-panel.styles.js";
import { Checkbox as CheckboxIOS } from "../../atoms/checkbox/checkbox.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (HIG) FilterPanel. Metro resolves this file on iOS; the docs import it for
// preview. The option rows render the iOS-styled Checkbox, the counts the
// iOS-styled Badge, and the header Clear action the iOS ghost Button so the panel
// reads native. The literal `.ios` atom imports are required for the WEB docs
// 3-up, where a barrel import would resolve the web atoms.
export const FilterPanel = createFilterPanel(iosSkin, CheckboxIOS, BadgeIOS, ButtonIOS);
export type { FilterPanelProps, FilterOption, FilterGroup } from "./filter-panel.shared.js";
