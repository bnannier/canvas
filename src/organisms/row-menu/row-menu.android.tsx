import { createRowMenu } from "./row-menu.shared.js";
import { androidSkin } from "./row-menu.styles.js";

// Material 3 (menu) RowMenu. Metro resolves this file on Android; the docs import it for preview.
export const RowMenu = createRowMenu(androidSkin);
export type { RowMenuProps, RowMenuItem } from "./row-menu.shared.js";
