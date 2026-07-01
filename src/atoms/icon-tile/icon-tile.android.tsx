import { createIconTile } from "./icon-tile.shared.js";
import { androidSkin } from "./icon-tile.styles.js";

// Material 3 IconTile. Metro resolves this file on Android (more-rounded container).
export const IconTile = createIconTile(androidSkin);
export type { IconTileProps } from "./icon-tile.shared.js";
