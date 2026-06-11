import { createDropdown } from "./dropdown.shared.js";
import { webSkin } from "./dropdown.styles.js";

// Web Dropdown (the base; Metro falls back to it on native, web bundlers resolve it).
export const Dropdown = createDropdown(webSkin);
export type { DropdownProps, DropdownItem } from "./dropdown.shared.js";
