import { createSwitch } from "./switch.shared.js";
import { androidSkin } from "./switch.styles.js";

// Material 3 Switch. Metro resolves this file on Android; the docs import it for preview.
export const Switch = createSwitch(androidSkin);
export type { SwitchProps } from "./switch.shared.js";
