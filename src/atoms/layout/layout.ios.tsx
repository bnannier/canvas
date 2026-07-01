import { createFlex } from "./layout.shared.js";
import { iosSkin } from "./layout.styles.js";

// iOS (HIG) Row / Column. Metro resolves this file on iOS. Layout is a Shared
// treatment: iosSkin references the same spacing scale as the web skin (flexbox
// has no native per-OS layout control to diverge to).
export const Row = createFlex(iosSkin, "row");
export const Column = createFlex(iosSkin, "column");
export type { FlexProps } from "./layout.shared.js";
