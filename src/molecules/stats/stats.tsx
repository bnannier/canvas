import { createStats } from "./stats.shared.js";
import { webSkin } from "./stats.styles.js";

// Web Stats (the base; Metro falls back to it on native, web bundlers resolve it).
/** Metric tiles, alone or in a row, with deltas, sparklines and comparisons. */
export const Stats = createStats(webSkin);
export type { StatItem, StatsProps } from "./stats.shared.js";
