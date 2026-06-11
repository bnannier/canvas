import { createRadio } from "./radio.shared.js";
import { iosSkin } from "./radio.styles.js";

// iOS (HIG) Radio. Metro resolves this file on iOS; the docs import it for preview.
export const Radio = createRadio(iosSkin);
export type { RadioProps } from "./radio.shared.js";
