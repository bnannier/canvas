import { createNumberInput } from "./number-input.shared.js";
import { iosSkin } from "./number-input.styles.js";

// iOS (HIG) NumberInput. Metro resolves this file on iOS.
export const NumberInput = createNumberInput(iosSkin);
export type { NumberInputProps } from "./number-input.shared.js";
