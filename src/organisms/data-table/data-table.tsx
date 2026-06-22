import { createDataTable } from "./data-table.shared.js";
import { webSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.js";

// Web DataTable (the base; Metro falls back to it on native, web bundlers resolve
// it). The selection column renders the web Checkbox.
export const DataTable = createDataTable(webSkin, Checkbox);
export type { DataTableProps } from "./data-table.shared.js";
