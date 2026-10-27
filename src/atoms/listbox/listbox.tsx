import { createListbox } from "./listbox.shared.js";
import { webSkin } from "./listbox.styles.js";

// Web Listbox (the base; web bundlers resolve this, Metro falls back to it on native).
/**
 * A custom single or multiple select with rich options (avatars, icons) and a checkmark on
 * the chosen ones.
 */
export const Listbox = createListbox(webSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
