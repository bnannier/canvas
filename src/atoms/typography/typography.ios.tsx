import { createTypography } from "./typography.shared.js";
import { iosSkin } from "./typography.styles.js";

// iOS (HIG) Typography. Metro resolves this file on iOS. Typography is a Shared
// treatment: iosSkin references the same type scale as the web skin, so this
// matches the base look exactly (no native type-scale control to diverge to).
export const Typography = createTypography(iosSkin);
export type { TypographyProps } from "./typography.shared.js";
