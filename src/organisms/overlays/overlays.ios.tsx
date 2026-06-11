import { createOverlay } from "./overlays.shared.js";
import { iosSkin } from "./overlays.styles.js";

// iOS (HIG sheet) Overlay. Metro resolves this file on iOS; the docs import it for preview.
export const Overlay = createOverlay(iosSkin);
export type { OverlayProps } from "./overlays.shared.js";
