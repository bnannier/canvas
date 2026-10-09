import { createRowMenu } from "./row-menu.shared.js";
import { webSkin } from "./row-menu.styles.js";

// Web RowMenu (the base; Metro falls back to it on native, web bundlers resolve it).
/** A vertical menu of actions and navigation links. */
export const RowMenu = createRowMenu(webSkin);
export type { RowMenuProps, RowMenuItem } from "./row-menu.shared.js";
