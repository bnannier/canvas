import { createGrid } from "./grid.shared.js";
import { webSkin } from "./grid.styles.js";

// Web Grid (the base; Metro falls back to it on native, web bundlers resolve
// it). Layout is a Shared treatment, so all three platform skins carry the
// same spacing scale.
export const Grid = createGrid(webSkin);
export { GridItem, gridColumns, gridCellWidth } from "./grid.shared.js";
export type { GridProps, GridItemProps } from "./grid.shared.js";
