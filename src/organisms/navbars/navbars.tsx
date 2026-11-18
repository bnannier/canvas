import { createNavbar } from "./navbars.shared.js";
import { webSkin } from "./navbars.styles.js";
import { useFormFactor } from "../../style/responsive.js";

function useMobileLayout() {
  return useFormFactor() !== "desktop";
}

// Web Navbar (the base; Metro falls back to it on native, web bundlers resolve it).
/** A top bar with navigation links, search and action buttons: the primary app-level navigation. */
export const Navbar = createNavbar(webSkin, { useMobileLayout });
export type { NavbarProps } from "./navbars.shared.js";
