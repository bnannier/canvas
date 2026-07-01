import { createFlex } from "./layout.shared.js";
import { androidSkin } from "./layout.styles.js";

// Material 3 Row / Column. Metro resolves this file on Android. Layout is a
// Shared treatment: androidSkin references the same spacing scale as the web skin
// (flexbox has no native per-OS layout control to diverge to).
export const Row = createFlex(androidSkin, "row");
export const Column = createFlex(androidSkin, "column");
export type { FlexProps } from "./layout.shared.js";
