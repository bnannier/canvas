import { createListbox } from "./listbox.shared.js";
import { webSkin } from "./listbox.styles.js";
import { CheckboxIndicator } from "../checkbox/indicator/index.js";

// Web Listbox (the base; web bundlers resolve this, Metro falls back to it on
// native). Listbox is a "Shared" treatment, so the iOS and Android skins are the
// same object as webSkin. Each entry supplies its platform's checkbox indicator.
export const Listbox = createListbox(webSkin, CheckboxIndicator);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
