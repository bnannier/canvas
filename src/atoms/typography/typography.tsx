import { createTypography } from "./typography.shared.js";
import { webSkin } from "./typography.styles.js";

// Web Typography (the base; Metro falls back to it on native, web bundlers
// resolve it). Typography is a Shared treatment, so all three platform skins
// carry the same type scale.
/**
 * Text in the kit's type scale: display, heading, lead, body, small, tiny and caption
 * roles, with tone and weight props.
 */
export const Typography = createTypography(webSkin);
export type { TypographyProps } from "./typography.shared.js";
