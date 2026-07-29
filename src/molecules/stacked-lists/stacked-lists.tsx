import { createStackedList } from "./stacked-lists.shared.js";
import { webSkin } from "./stacked-lists.styles.js";

// Web StackedList (the base; Metro falls back to it on native, web bundlers resolve it).
// The composed atoms and the reorderable rows' DnD family default to the web builds
// inside createStackedList.
export const StackedList = createStackedList(webSkin);
export type { StackedListProps, StackedListItem, StackedListMove } from "./stacked-lists.shared.js";
