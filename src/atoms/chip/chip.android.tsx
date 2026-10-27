import { createChip } from "./chip.shared.js";
import { androidSkin } from "./chip.styles.js";

// Material 3 Chip. Metro resolves this file on Android.
export const Chip = createChip(androidSkin);
export type { ChipProps } from "./chip.shared.js";
// The pick-one set of chips draws no chrome of its own, so every platform shares it.
export { ChipGroup, type ChipGroupProps } from "./chip-group.js";
