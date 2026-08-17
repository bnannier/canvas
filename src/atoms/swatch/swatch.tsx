import { createSwatch } from "./swatch.shared.js";
import { webSkin } from "./swatch.styles.js";

// Web Swatch (the base; Metro falls back to it on native, web bundlers resolve it).
// Display-only: no press feedback on any platform, so this skin carries no ripple or
// pressed opacity.
export const Swatch = createSwatch(webSkin);
export type { SwatchProps } from "./swatch.shared.js";
