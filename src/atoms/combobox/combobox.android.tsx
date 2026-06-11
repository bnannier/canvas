import { createCombobox } from "./combobox.shared.js";
import { androidSkin } from "./combobox.styles.js";

// Material 3 Combobox. Metro resolves this file on Android; the docs import it for preview.
export const Combobox = createCombobox(androidSkin);
export type { ComboboxProps } from "./combobox.shared.js";
