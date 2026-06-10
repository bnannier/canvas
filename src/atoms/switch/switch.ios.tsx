import { createSwitch } from "./switch.shared.js";
import { iosSkin } from "./switch.styles.js";

// iOS (HIG) Switch. Metro resolves this file on iOS; the docs import it for preview.
export const Switch = createSwitch(iosSkin);
export type { SwitchProps } from "./switch.shared.js";
