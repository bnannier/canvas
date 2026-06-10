import { createButton } from "./button.shared.js";
import { iosSkin } from "./button.styles.js";

// iOS (HIG) Button. Metro resolves this file on iOS; the docs import it for preview.
export const Button = createButton(iosSkin);
export type { ButtonProps } from "./button.shared.js";
