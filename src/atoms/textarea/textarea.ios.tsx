import { createTextarea } from "./textarea.shared.js";
import { iosSkin } from "./textarea.styles.js";

// iOS (HIG text view) Textarea. Metro resolves this file on iOS; the docs import it for preview.
export const Textarea = createTextarea(iosSkin);
export type { TextareaProps } from "./textarea.shared.js";
