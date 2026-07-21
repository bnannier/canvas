import { createBadge } from "./badge.shared.js";
import { androidSkin } from "./badge.styles.js";

// Material 3 Badge. Metro resolves this file on Android; the docs import it for preview.
export const Badge = createBadge(androidSkin);
// BadgeGroup is layout-only (no skin), so it re-exports unchanged on every platform.
export { BadgeGroup } from "./badge.shared.js";
export type { BadgeProps, BadgeGroupProps } from "./badge.shared.js";
