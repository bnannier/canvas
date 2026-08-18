import { createBarList } from "./bar-list.shared.js";
import { androidSkin } from "../shared/charts.styles.js";

// BarList is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry builds from the same skin. The per-OS
// files exist only so the architecture is uniform across the kit.
export const BarList = createBarList(androidSkin);
export type { BarListProps, BreakdownRow } from "./bar-list.shared.js";
