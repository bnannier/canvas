import { createIcon } from "./icon.shared.js";
import { iosSkin } from "./icon.styles.js";

// iOS (HIG) Icon. Metro resolves this file on iOS; the docs import it for preview.
// Icon is a "Shared" treatment: an outline glyph is platform-neutral, so iosSkin
// equals the web skin — one look on every platform.
export const Icon = createIcon(iosSkin);
export type { IconProps } from "./icon.shared.js";
