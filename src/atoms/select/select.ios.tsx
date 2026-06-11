import { createSelect } from "./select.shared.js";
import { iosSkin } from "./select.styles.js";

// iOS (HIG pop-up button) Select. Metro resolves this file on iOS; the docs import it for preview.
export const Select = createSelect(iosSkin);
export type { SelectProps } from "./select.shared.js";
