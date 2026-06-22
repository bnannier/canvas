import { createBreadcrumb } from "./breadcrumb.shared.js";
import { iosSkin } from "./breadcrumb.styles.js";

// iOS (HIG) Breadcrumb. Metro resolves this file on iOS; the docs import it for
// preview. SF-style tightened tracking; an opacity dim on link press.
export const { Breadcrumb, BreadcrumbItem } = createBreadcrumb(iosSkin);
export type { BreadcrumbProps, BreadcrumbItemProps } from "./breadcrumb.shared.js";
