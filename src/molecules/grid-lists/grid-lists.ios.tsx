import { createGridList } from "./grid-lists.shared.js";
import { iosSkin } from "./grid-lists.styles.js";

// iOS (HIG Collections) GridList. Metro resolves this file on iOS; the docs import
// it for preview. Softer thumbnail corner and SF type tightening; press = opacity dim.
export const GridList = createGridList(iosSkin);
export type { GridListProps, GridListItem, GridListAction } from "./grid-lists.shared.js";
