import { createStats } from "./stats.shared.js";
import { iosSkin } from "./stats.styles.js";

// iOS (HIG / SF) Stats. Metro resolves this file on iOS; the docs import it for preview.
export const Stats = createStats(iosSkin);
export type { StatItem, StatsProps } from "./stats.shared.js";
