import { createBadge } from "./badge.shared.js";
import { webSkin } from "./badge.styles.js";

// Web Badge (the base; Metro falls back to it on native, web bundlers resolve it).
/**
 * A small pill for metadata (a role, a tag, a count) or a status (success, warning,
 * destructive), with an optional status dot.
 */
export const Badge = createBadge(webSkin);
// BadgeGroup is layout-only (no skin), so it re-exports unchanged on every platform.
export { BadgeGroup } from "./badge.shared.js";
export type { BadgeProps, BadgeGroupProps } from "./badge.shared.js";
