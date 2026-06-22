import { createDataTable } from "./data-table.shared.js";
import { iosSkin } from "./data-table.styles.js";
import { Checkbox } from "../../atoms/checkbox/checkbox.ios.js";

// iOS (SwiftUI Table / grouped-list rhythm) DataTable. Metro resolves this file
// on iOS; the docs import it for preview. The selection column renders the iOS
// Checkbox.
export const DataTable = createDataTable(iosSkin, Checkbox);
export type { DataTableProps } from "./data-table.shared.js";
