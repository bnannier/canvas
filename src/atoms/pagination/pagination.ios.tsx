import { createPagination } from "./pagination.shared.js";
import { iosSkin } from "./pagination.styles.js";

// iOS (HIG page controls) Pagination. Metro resolves this file on iOS; the docs import it for preview.
export const Pagination = createPagination(iosSkin);
export type { PaginationProps } from "./pagination.shared.js";
