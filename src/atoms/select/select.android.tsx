import { createSelect } from "./select.shared.js";
import { androidSkin } from "./select.styles.js";

// Material 3 (exposed dropdown) Select. Metro resolves this file on Android; the docs import it for preview.
export const Select = createSelect(androidSkin);
export type { SelectProps } from "./select.shared.js";
