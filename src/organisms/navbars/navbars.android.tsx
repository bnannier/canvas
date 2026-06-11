import { createNavbar } from "./navbars.shared.js";
import { androidSkin } from "./navbars.styles.js";

// Material 3 (top app bar) Navbar. Metro resolves this file on Android; the docs import it for preview.
export const Navbar = createNavbar(androidSkin);
export type { NavbarProps } from "./navbars.shared.js";
