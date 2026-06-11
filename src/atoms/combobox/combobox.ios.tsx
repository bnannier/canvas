import { createCombobox } from "./combobox.shared.js";
import { iosSkin } from "./combobox.styles.js";

// iOS (HIG) Combobox. Metro resolves this file on iOS; the docs import it for preview.
export const Combobox = createCombobox(iosSkin);
export type { ComboboxProps } from "./combobox.shared.js";
