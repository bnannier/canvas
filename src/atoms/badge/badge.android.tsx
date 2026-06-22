import { createBadge } from "./badge.shared.js";
import { androidSkin } from "./badge.styles.js";

// Material 3 Badge. Metro resolves this file on Android; the docs import it for preview.
export const Badge = createBadge(androidSkin);
export type { BadgeProps } from "./badge.shared.js";
