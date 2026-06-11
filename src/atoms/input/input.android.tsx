import { createInput } from "./input.shared.js";
import { androidSkin } from "./input.styles.js";

// Material 3 Input. Metro resolves this file on Android; the docs import it for preview.
export const Input = createInput(androidSkin);
export type { InputProps } from "./input.shared.js";
