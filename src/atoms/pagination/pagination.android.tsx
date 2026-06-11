import { createPagination } from "./pagination.shared.js";
import { androidSkin } from "./pagination.styles.js";

// Material 3 Pagination. Metro resolves this file on Android; the docs import it for preview.
export const Pagination = createPagination(androidSkin);
export type { PaginationProps } from "./pagination.shared.js";
