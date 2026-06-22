import { createTypography } from "./typography.shared.js";
import { androidSkin } from "./typography.styles.js";

// Material 3 Typography. Metro resolves this file on Android. Typography is a
// Shared treatment: androidSkin references the same type scale as the web skin,
// so this matches the base look exactly (the kit type tokens already serve the
// Material 3 type roles, no divergence needed).
export const Typography = createTypography(androidSkin);
export type { TypographyProps } from "./typography.shared.js";
