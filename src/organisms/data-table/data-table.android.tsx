import { createDataTable } from "./data-table.shared.js";
import { androidSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.android.js";
import { Pagination } from "../../atoms/pagination/pagination.android.js";
import { Skeleton } from "../../atoms/skeleton/skeleton.android.js";

// Material 3 (list rhythm) DataTable. Metro resolves this file on Android; the
// docs import it for preview. The composed parts (selection Checkbox, footer
// Pagination, loading Skeleton) are the Material 3 variants.
export const DataTable = createDataTable(androidSkin, { Checkbox, Pagination, Skeleton });
export type { DataTableProps, DataTableColumn, DataTableSort } from "./data-table.shared.js";
