import { createTextarea } from "./textarea.shared.js";
import { webSkin } from "./textarea.styles.js";

// Web Textarea (the base; Metro falls back to it on native, web bundlers resolve it).
/** A multi-line text field, with an optional character count and toolbar. */
export const Textarea = createTextarea(webSkin);
export type { TextareaProps } from "./textarea.shared.js";
