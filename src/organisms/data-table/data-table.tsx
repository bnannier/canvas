import { createDataTable } from "./data-table.shared.js";
import { webSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.js";
import { Pagination } from "../../atoms/pagination/pagination.js";
import { Skeleton } from "../../atoms/skeleton/skeleton.js";

// Web DataTable (the base; Metro falls back to it on native, web bundlers resolve
// it). The composed parts (selection Checkbox, footer Pagination, loading
// Skeleton) are the web variants.
export const DataTable = createDataTable(webSkin, { Checkbox, Pagination, Skeleton });
export type { DataTableProps, DataTableColumn, DataTableSort } from "./data-table.shared.js";
