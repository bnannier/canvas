import { createDropdown } from "./dropdown.shared.js";
import { webSkin } from "./dropdown.styles.js";

// Web Dropdown (the base; Metro falls back to it on native, web bundlers resolve it).
/** A floating menu of actions, options or links, opened by a trigger. */
export const Dropdown = createDropdown(webSkin);
export type { DropdownProps, DropdownItem } from "./dropdown.shared.js";
