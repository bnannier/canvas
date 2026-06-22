import { createFieldset } from "./fieldset.shared.js";
import { webSkin } from "./fieldset.styles.js";

// Web Fieldset (the base; Metro falls back to it on native, web bundlers resolve it).
// Composes the web Input/Checkbox atoms (the createFieldset defaults).
export const Fieldset = createFieldset(webSkin);
export type { FieldsetProps, FieldsetItem } from "./fieldset.shared.js";
