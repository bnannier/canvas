import { createNavbar } from "./navbars.shared.js";
import { iosSkin } from "./navbars.styles.js";

// iOS (HIG navigation bar) Navbar. Metro resolves this file on iOS; the docs import it for preview.
export const Navbar = createNavbar(iosSkin);
export type { NavbarProps } from "./navbars.shared.js";
