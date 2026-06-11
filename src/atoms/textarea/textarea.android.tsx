import { createTextarea } from "./textarea.shared.js";
import { androidSkin } from "./textarea.styles.js";

// Material 3 filled Textarea. Metro resolves this file on Android; the docs import it for preview.
export const Textarea = createTextarea(androidSkin);
export type { TextareaProps } from "./textarea.shared.js";
