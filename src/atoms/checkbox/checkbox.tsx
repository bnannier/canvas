import { createCheckbox } from "./checkbox.shared.js";
import { webSkin } from "./checkbox.styles.js";

// Web Checkbox (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A multi-select option or a single yes or no setting, with its label and description as
 * children. A standalone setting renders the platform switch on iOS and Android.
 */
export const Checkbox = createCheckbox(webSkin);
export type { CheckboxProps } from "./checkbox.shared.js";
