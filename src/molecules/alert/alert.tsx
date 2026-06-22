import { createAlert } from "./alert.shared.js";
import { webSkin } from "./alert.styles.js";

// Web Alert (the base; Metro falls back to it on native, web bundlers resolve it).
export const Alert = createAlert(webSkin);
export type { AlertProps } from "./alert.shared.js";
