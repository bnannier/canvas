import { createButton } from "./button.shared.js";
import { webSkin } from "./button.styles.js";

// Web Button (the base; Metro falls back to it on native, web bundlers resolve it).
export const Button = createButton(webSkin);
export type { ButtonProps } from "./button.shared.js";
