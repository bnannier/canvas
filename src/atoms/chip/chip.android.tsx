import { createChip } from "./chip.shared.js";
import { androidSkin } from "./chip.styles.js";

// Material 3 Chip. Metro resolves this file on Android.
export const Chip = createChip(androidSkin);
export type { ChipProps } from "./chip.shared.js";
