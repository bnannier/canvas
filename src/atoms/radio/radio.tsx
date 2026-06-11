import { createRadio } from "./radio.shared.js";
import { webSkin } from "./radio.styles.js";

// Web Radio (the base; Metro falls back to it on native, web bundlers resolve it).
export const Radio = createRadio(webSkin);
export type { RadioProps } from "./radio.shared.js";
