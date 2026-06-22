import { createNumberInput } from "./number-input.shared.js";
import { androidSkin } from "./number-input.styles.js";

// Material 3 NumberInput. Metro resolves this on Android.
export const NumberInput = createNumberInput(androidSkin);
export type { NumberInputProps } from "./number-input.shared.js";
