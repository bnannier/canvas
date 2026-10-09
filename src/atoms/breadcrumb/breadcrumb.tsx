import { createBreadcrumb } from "./breadcrumb.shared.js";
import { webSkin } from "./breadcrumb.styles.js";

// Web Breadcrumb (the base; Metro falls back to it on native, web bundlers resolve
// it). Keeps the current Catalyst/shadcn trail with an active:opacity-70 link dim.
// One build, exported member by member so each carries its own summary (a destructured
// export reaches the published declarations without one).
const breadcrumb = createBreadcrumb(webSkin);
/** Hierarchical navigation showing where the current page sits. */
export const Breadcrumb = breadcrumb.Breadcrumb;
/** One crumb in a Breadcrumb trail. */
export const BreadcrumbItem = breadcrumb.BreadcrumbItem;
export type { BreadcrumbProps, BreadcrumbItemProps } from "./breadcrumb.shared.js";
