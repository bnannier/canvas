import { createChip } from "./chip.shared.js";
import { webSkin } from "./chip.styles.js";

// Web Chip (the base; Metro falls back to it on native, web bundlers resolve it).
export const Chip = createChip(webSkin);
export type { ChipProps } from "./chip.shared.js";
