import { createButton } from "./button.shared.js";
import { webSkin } from "./button.styles.js";

// Web Button (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A pressable action with an intent (primary by default, then outline, secondary, ghost,
 * destructive, link), a size, and loading, disabled and block states.
 */
export const Button = createButton(webSkin);
export type { ButtonProps } from "./button.shared.js";
