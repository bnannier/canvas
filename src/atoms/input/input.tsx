import { createInput } from "./input.shared.js";
import { webSkin } from "./input.styles.js";

// Web Input (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A single-line text field with semantic states and sizes, prefix and suffix addons, an
 * icon, a password toggle and a clear button.
 */
export const Input = createInput(webSkin);
export type { InputProps } from "./input.shared.js";
