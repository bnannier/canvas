import { createCheckbox } from "./checkbox.shared.js";
import { androidSkin } from "./checkbox.styles.js";

// Material 3 Checkbox. Metro resolves this file on Android; the docs import it for preview.
export const Checkbox = createCheckbox(androidSkin);
export type { CheckboxProps } from "./checkbox.shared.js";
