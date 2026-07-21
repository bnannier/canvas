import { createDataTable } from "./data-table.shared.js";
import { iosSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.ios.js";
import { Pagination } from "../../atoms/pagination/pagination.ios.js";
import { Skeleton } from "../../atoms/skeleton/skeleton.ios.js";

// iOS (SwiftUI Table / grouped-list rhythm) DataTable. Metro resolves this file
// on iOS; the docs import it for preview. The composed parts (selection
// Checkbox, footer Pagination, loading Skeleton) are the iOS variants.
export const DataTable = createDataTable(iosSkin, { Checkbox, Pagination, Skeleton });
export type { DataTableProps, DataTableColumn, DataTableSort } from "./data-table.shared.js";
