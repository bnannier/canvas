import { createServiceHealthList } from "./service-health-list.shared.js";
import { iosSkin } from "../shared/charts.styles.js";

// ServiceHealthList is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
export const ServiceHealthList = createServiceHealthList(iosSkin);
export type { ServiceHealthListProps, ServiceHealthItem, UptimePeriod } from "./service-health-list.shared.js";
