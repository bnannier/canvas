import { createOverlay } from "./overlays.shared.js";
import { webSkin } from "./overlays.styles.js";

// Web Overlay (the base; Metro falls back to it on native, web bundlers resolve it).
export const Overlay = createOverlay(webSkin);
export type { OverlayProps } from "./overlays.shared.js";
