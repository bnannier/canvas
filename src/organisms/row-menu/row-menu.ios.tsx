import { createRowMenu } from "./row-menu.shared.js";
import { iosSkin } from "./row-menu.styles.js";

// iOS (HIG context menu) RowMenu. Metro resolves this file on iOS; the docs import it for preview.
export const RowMenu = createRowMenu(iosSkin);
export type { RowMenuProps, RowMenuItem } from "./row-menu.shared.js";
