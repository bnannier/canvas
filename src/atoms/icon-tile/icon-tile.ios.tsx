import { createIconTile } from "./icon-tile.shared.js";
import { iosSkin } from "./icon-tile.styles.js";

// iOS (HIG) IconTile. Metro resolves this file on iOS.
export const IconTile = createIconTile(iosSkin);
export type { IconTileProps } from "./icon-tile.shared.js";
