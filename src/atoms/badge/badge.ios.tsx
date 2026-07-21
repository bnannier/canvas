import { createBadge } from "./badge.shared.js";
import { iosSkin } from "./badge.styles.js";

// iOS (HIG) Badge. Metro resolves this file on iOS; the docs import it for preview.
export const Badge = createBadge(iosSkin);
// BadgeGroup is layout-only (no skin), so it re-exports unchanged on every platform.
export { BadgeGroup } from "./badge.shared.js";
export type { BadgeProps, BadgeGroupProps } from "./badge.shared.js";
