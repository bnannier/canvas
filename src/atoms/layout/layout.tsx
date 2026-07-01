import { createFlex } from "./layout.shared.js";
import { webSkin } from "./layout.styles.js";

// Web Row / Column (the base; Metro falls back to it on native, web bundlers
// resolve it). Layout is a Shared treatment, so all three platform skins carry
// the same spacing scale.
export const Row = createFlex(webSkin, "row");
export const Column = createFlex(webSkin, "column");
export type { FlexProps } from "./layout.shared.js";
