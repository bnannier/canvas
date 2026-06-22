import { createDataTable } from "./data-table.shared.js";
import { androidSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.android.js";

// Material 3 (list rhythm) DataTable. Metro resolves this file on Android; the
// docs import it for preview. The selection column renders the Material 3
// Checkbox.
export const DataTable = createDataTable(androidSkin, Checkbox);
export type { DataTableProps } from "./data-table.shared.js";
