import { createFlex } from "./layout.shared.js";
import { webSkin } from "./layout.styles.js";

// Web Row / Column (the base; Metro falls back to it on native, web bundlers
// resolve it). Layout is a Shared treatment, so all three platform skins carry
// the same spacing scale.
/**
 * A horizontal layout container with a semantic gap scale, alignment and distribution
 * props, wrapping, and the option to stack into a column at narrow widths.
 */
export const Row = createFlex(webSkin, "row");
/** A vertical layout container with a semantic gap scale and alignment and distribution props. */
export const Column = createFlex(webSkin, "column");
export type { FlexProps } from "./layout.shared.js";
