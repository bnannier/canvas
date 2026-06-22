import { createFilterPanel } from "./filter-panel.shared.js";
import { webSkin } from "./filter-panel.styles.js";

// Web FilterPanel (the base; Metro falls back to it on native, web bundlers resolve it).
// Uses the default web Checkbox/Badge passed by createFilterPanel.
export const FilterPanel = createFilterPanel(webSkin);
export type { FilterPanelProps, FilterOption, FilterGroup } from "./filter-panel.shared.js";
