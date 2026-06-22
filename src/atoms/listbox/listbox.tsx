import { createListbox } from "./listbox.shared.js";
import { webSkin } from "./listbox.styles.js";

// Web Listbox (the base; web bundlers resolve this, Metro falls back to it on
// native). Listbox is a "Shared" treatment, so the iOS and Android skins are the
// same object as webSkin and all platforms render identically.
export const Listbox = createListbox(webSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
