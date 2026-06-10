import { createSwitch } from "./switch.shared.js";
import { webSkin } from "./switch.styles.js";

// Web Switch (the base; Metro falls back to it on native, web bundlers resolve it).
export const Switch = createSwitch(webSkin);
export type { SwitchProps } from "./switch.shared.js";
