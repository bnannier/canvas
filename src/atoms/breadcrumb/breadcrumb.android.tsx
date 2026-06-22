import { createBreadcrumb } from "./breadcrumb.shared.js";
import { androidSkin } from "./breadcrumb.styles.js";

// Material 3 Breadcrumb. Metro resolves this file on Android; the docs import it
// for preview. M3 label tracking; a borderless android_ripple on link press.
export const { Breadcrumb, BreadcrumbItem } = createBreadcrumb(androidSkin);
export type { BreadcrumbProps, BreadcrumbItemProps } from "./breadcrumb.shared.js";
