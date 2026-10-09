import { createChip } from "./chip.shared.js";
import { webSkin } from "./chip.styles.js";

// Web Chip (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * An interactive pill for filters, tags and selectable tokens, with an optional icon and a
 * remove button.
 */
export const Chip = createChip(webSkin);
export type { ChipProps } from "./chip.shared.js";
