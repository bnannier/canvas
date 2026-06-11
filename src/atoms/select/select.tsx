import { createSelect } from "./select.shared.js";
import { webSkin } from "./select.styles.js";

// Web Select (the base; Metro falls back to it on native, web bundlers resolve it).
export const Select = createSelect(webSkin);
export type { SelectProps } from "./select.shared.js";
