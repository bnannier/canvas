import { createIcon } from "./icon.shared.js";
import { androidSkin } from "./icon.styles.js";

// Material 3 Icon. Metro resolves this file on Android; the docs import it for preview.
// Icon is a "Shared" treatment: an outline glyph is platform-neutral, so androidSkin
// equals the web skin — one look on every platform.
export const Icon = createIcon(androidSkin);
export type { IconProps } from "./icon.shared.js";
