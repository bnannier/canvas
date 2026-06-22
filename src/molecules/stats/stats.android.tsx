import { createStats } from "./stats.shared.js";
import { androidSkin } from "./stats.styles.js";

// Material 3 Stats. Metro resolves this file on Android; the docs import it for preview.
export const Stats = createStats(androidSkin);
export type { StatItem, StatsProps } from "./stats.shared.js";
