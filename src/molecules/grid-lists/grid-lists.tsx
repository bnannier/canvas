import { createGridList } from "./grid-lists.shared.js";
import { webSkin } from "./grid-lists.styles.js";

// Web GridList (the base; Metro falls back to it on native, web bundlers resolve it).
/** A tiled grid of cards for directories, collections and galleries. */
export const GridList = createGridList(webSkin);
export type { GridListProps, GridListItem, GridListAction } from "./grid-lists.shared.js";
