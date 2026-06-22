import { createStackedList } from "./stacked-lists.shared.js";
import { iosSkin } from "./stacked-lists.styles.js";

// iOS (SF / HIG inset-grouped list) StackedList. Metro resolves this file on iOS;
// the docs import it for preview.
export const StackedList = createStackedList(iosSkin);
export type { StackedListProps, StackedListItem } from "./stacked-lists.shared.js";
