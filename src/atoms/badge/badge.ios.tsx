import { createBadge } from "./badge.shared.js";
import { iosSkin } from "./badge.styles.js";

// iOS (HIG) Badge. Metro resolves this file on iOS; the docs import it for preview.
export const Badge = createBadge(iosSkin);
export type { BadgeProps } from "./badge.shared.js";
