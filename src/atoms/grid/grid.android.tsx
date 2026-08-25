import { createGrid } from "./grid.shared.js";
import { androidSkin } from "./grid.styles.js";

// Material 3 Grid. Metro resolves this file on Android. Layout is a Shared
// treatment: androidSkin references the same spacing scale as the web skin.
export const Grid = createGrid(androidSkin);
export { GridItem, gridColumns, gridCellWidth } from "./grid.shared.js";
export type { GridProps, GridItemProps } from "./grid.shared.js";
