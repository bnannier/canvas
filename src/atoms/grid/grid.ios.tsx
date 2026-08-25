import { createGrid } from "./grid.shared.js";
import { iosSkin } from "./grid.styles.js";

// iOS (HIG) Grid. Metro resolves this file on iOS. Layout is a Shared
// treatment: iosSkin references the same spacing scale as the web skin.
export const Grid = createGrid(iosSkin);
export { GridItem, gridColumns, gridCellWidth } from "./grid.shared.js";
export type { GridProps, GridItemProps } from "./grid.shared.js";
