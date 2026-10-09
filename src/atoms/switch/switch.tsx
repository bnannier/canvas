import { createSwitch } from "./switch.shared.js";
import { webSkin } from "./switch.styles.js";

// Web Switch (the base; Metro falls back to it on native, web bundlers resolve it).
/** An on and off switch, with its label and description as children. */
export const Switch = createSwitch(webSkin);
export type { SwitchProps } from "./switch.shared.js";
