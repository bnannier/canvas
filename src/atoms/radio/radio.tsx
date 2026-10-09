import { createRadio } from "./radio.shared.js";
import { createRadioGroup } from "./radio-group.shared.js";
import { webSkin } from "./radio.styles.js";

// Web Radio and RadioGroup (the base; Metro falls back to it on native, web bundlers resolve it).
/** One option of a single-pick choice, with its label and description as children. */
export const Radio = createRadio(webSkin);
/** A single-pick choice: holds the selected value for the Radio options inside it. */
export const RadioGroup = createRadioGroup(webSkin);
export type { RadioProps } from "./radio.shared.js";
export type { RadioGroupProps } from "./radio-group.shared.js";
