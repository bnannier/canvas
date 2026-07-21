import { createBadge } from "./badge.shared.js";
import { webSkin } from "./badge.styles.js";

// Web Badge (the base; Metro falls back to it on native, web bundlers resolve it).
export const Badge = createBadge(webSkin);
// BadgeGroup is layout-only (no skin), so it re-exports unchanged on every platform.
export { BadgeGroup } from "./badge.shared.js";
export type { BadgeProps, BadgeGroupProps } from "./badge.shared.js";
