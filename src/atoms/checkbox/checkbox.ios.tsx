import { createCheckbox } from "./checkbox.shared.js";
import { iosSkin } from "./checkbox.styles.js";

// iOS (HIG) Checkbox. Metro resolves this file on iOS; the docs import it for preview.
export const Checkbox = createCheckbox(iosSkin);
export type { CheckboxProps } from "./checkbox.shared.js";
