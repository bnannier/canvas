import { createKbd } from "./kbd.shared.js";
import { webSkin } from "./kbd.styles.js";

// Web Kbd (the base; Metro falls back to it on native, web bundlers resolve it).
export const Kbd = createKbd(webSkin);
export type { KbdProps } from "./kbd.shared.js";
