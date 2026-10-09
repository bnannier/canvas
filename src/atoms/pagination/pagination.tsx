import { createPagination } from "./pagination.shared.js";
import { webSkin } from "./pagination.styles.js";

// Web Pagination (the base; Metro falls back to it on native, web bundlers resolve it).
/** Page-of-N navigation for tables and lists, with an optional rows-per-page control. */
export const Pagination = createPagination(webSkin);
export type { PaginationProps } from "./pagination.shared.js";
