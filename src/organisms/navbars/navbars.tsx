import { createNavbar } from "./navbars.shared.js";
import { webSkin } from "./navbars.styles.js";

// Web Navbar (the base; Metro falls back to it on native, web bundlers resolve it).
export const Navbar = createNavbar(webSkin);
export type { NavbarProps } from "./navbars.shared.js";
