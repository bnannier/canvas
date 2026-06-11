import { createInput } from "./input.shared.js";
import { iosSkin } from "./input.styles.js";

// iOS (HIG) Input. Metro resolves this file on iOS; the docs import it for preview.
export const Input = createInput(iosSkin);
export type { InputProps } from "./input.shared.js";
