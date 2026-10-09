import { createServiceHealthList } from "./service-health-list.shared.js";
import { webSkin } from "../shared/charts.styles.js";

// ServiceHealthList is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry builds from the same skin. The
// per-OS files exist only so the architecture is uniform across the kit.
/** Per-service status rows: a dot, the name, a detail and a mini uptime strip. */
export const ServiceHealthList = createServiceHealthList(webSkin);
export type { ServiceHealthListProps, ServiceHealthItem, UptimePeriod } from "./service-health-list.shared.js";
