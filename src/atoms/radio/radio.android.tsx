import { createRadio } from "./radio.shared.js";
import { androidSkin } from "./radio.styles.js";

// Material 3 Radio. Metro resolves this file on Android; the docs import it for preview.
export const Radio = createRadio(androidSkin);
export type { RadioProps } from "./radio.shared.js";
