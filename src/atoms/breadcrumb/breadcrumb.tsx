import { createBreadcrumb } from "./breadcrumb.shared.js";
import { webSkin } from "./breadcrumb.styles.js";

// Web Breadcrumb (the base; Metro falls back to it on native, web bundlers resolve
// it). Keeps the current Catalyst/shadcn trail with an active:opacity-70 link dim.
export const { Breadcrumb, BreadcrumbItem } = createBreadcrumb(webSkin);
export type { BreadcrumbProps, BreadcrumbItemProps } from "./breadcrumb.shared.js";
