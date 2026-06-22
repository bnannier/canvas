import { createGridList } from "./grid-lists.shared.js";
import { androidSkin } from "./grid-lists.styles.js";

// Material 3 GridList. Metro resolves this file on Android; the docs import it for
// preview. M3 12dp thumbnail, M3 label tracking, and an android_ripple press feedback.
export const GridList = createGridList(androidSkin);
export type { GridListProps, GridListItem, GridListAction } from "./grid-lists.shared.js";
