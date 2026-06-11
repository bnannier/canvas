import { createInput } from "./input.shared.js";
import { webSkin } from "./input.styles.js";

// Web Input (the base; Metro falls back to it on native, web bundlers resolve it).
export const Input = createInput(webSkin);
export type { InputProps } from "./input.shared.js";
