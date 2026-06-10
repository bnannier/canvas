import { createButton } from "./button.shared.js";
import { androidSkin } from "./button.styles.js";

// Material 3 Button. Metro resolves this file on Android; the docs import it for preview.
export const Button = createButton(androidSkin);
export type { ButtonProps } from "./button.shared.js";
