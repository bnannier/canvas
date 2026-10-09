import { createNavbar } from "./navbars.shared.js";
import { webSkin } from "./navbars.styles.js";

// Web Navbar (the base; Metro falls back to it on native, web bundlers resolve it).
/** A top bar with navigation links, search and action buttons: the primary app-level navigation. */
export const Navbar = createNavbar(webSkin);
export type { NavbarProps } from "./navbars.shared.js";
