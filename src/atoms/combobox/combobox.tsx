import { createCombobox } from "./combobox.shared.js";
import { webSkin } from "./combobox.styles.js";

// Web Combobox (the base; Metro falls back to it on native, web bundlers resolve it).
export const Combobox = createCombobox(webSkin);
export type { ComboboxProps } from "./combobox.shared.js";
