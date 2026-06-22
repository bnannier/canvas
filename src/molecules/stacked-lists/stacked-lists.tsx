import { createStackedList } from "./stacked-lists.shared.js";
import { webSkin } from "./stacked-lists.styles.js";

// Web StackedList (the base; Metro falls back to it on native, web bundlers resolve it).
export const StackedList = createStackedList(webSkin);
export type { StackedListProps, StackedListItem } from "./stacked-lists.shared.js";
