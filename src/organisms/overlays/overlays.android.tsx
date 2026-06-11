import { createOverlay } from "./overlays.shared.js";
import { androidSkin } from "./overlays.styles.js";

// Material 3 bottom sheet Overlay. Metro resolves this file on Android; the docs import it for preview.
export const Overlay = createOverlay(androidSkin);
export type { OverlayProps } from "./overlays.shared.js";
