import { createAlert } from "./alert.shared.js";
import { webSkin } from "./alert.styles.js";

// Web Alert (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * An inline notification banner: info, success, warning or destructive, or a full-width
 * announcement bar.
 */
export const Alert = createAlert(webSkin);
export type { AlertProps } from "./alert.shared.js";
