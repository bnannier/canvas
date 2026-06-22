import { createStackedList } from "./stacked-lists.shared.js";
import { androidSkin } from "./stacked-lists.styles.js";

// Material 3 StackedList. Metro resolves this file on Android; the docs import it for preview.
export const StackedList = createStackedList(androidSkin);
export type { StackedListProps, StackedListItem } from "./stacked-lists.shared.js";
