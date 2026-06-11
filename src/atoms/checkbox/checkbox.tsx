import { createCheckbox } from "./checkbox.shared.js";
import { webSkin } from "./checkbox.styles.js";

// Web Checkbox (the base; Metro falls back to it on native, web bundlers resolve it).
export const Checkbox = createCheckbox(webSkin);
export type { CheckboxProps } from "./checkbox.shared.js";
