import { createTextarea } from "./textarea.shared.js";
import { webSkin } from "./textarea.styles.js";

// Web Textarea (the base; Metro falls back to it on native, web bundlers resolve it).
export const Textarea = createTextarea(webSkin);
export type { TextareaProps } from "./textarea.shared.js";
