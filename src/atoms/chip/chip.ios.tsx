import { createChip } from "./chip.shared.js";
import { iosSkin } from "./chip.styles.js";

// iOS (HIG) Chip. Metro resolves this file on iOS.
export const Chip = createChip(iosSkin);
export type { ChipProps } from "./chip.shared.js";
