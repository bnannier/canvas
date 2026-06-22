import { createBadge } from "./badge.shared.js";
import { webSkin } from "./badge.styles.js";

// Web Badge (the base; Metro falls back to it on native, web bundlers resolve it).
export const Badge = createBadge(webSkin);
export type { BadgeProps } from "./badge.shared.js";
