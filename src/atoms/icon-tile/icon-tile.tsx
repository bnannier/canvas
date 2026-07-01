import { createIconTile } from "./icon-tile.shared.js";
import { webSkin } from "./icon-tile.styles.js";

// Web IconTile (the base; Metro falls back to it on native, web bundlers resolve it).
export const IconTile = createIconTile(webSkin);
export type { IconTileProps } from "./icon-tile.shared.js";
