import { createNavbar } from "./navbars.shared.js";
import { iosSkin } from "./navbars.styles.js";
// The literal `.ios` import (not the barrel) is required for the WEB docs 3-up,
// where a bare import would resolve the web Dropdown in every column.
import { Dropdown } from "../../atoms/dropdown/dropdown.ios.js";

// iOS (HIG navigation bar) Navbar. Metro resolves this file on iOS; the docs import it for preview.
export const Navbar = createNavbar(iosSkin, { Dropdown });
export type { NavbarProps } from "./navbars.shared.js";
