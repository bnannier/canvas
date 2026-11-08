import { createFlowEditor } from "./flow-editor.shared.js";
import { webSkin } from "./flow-editor.styles.js";
import { Button } from "../../atoms/button/button.js";
import { Select } from "../../atoms/select/select.js";

/** A node-graph editor: cards on a pannable, zoomable canvas joined by directed edges. */
export const FlowEditor = createFlowEditor(webSkin, { Button, Select });
export type { FlowEdge, FlowNode, FlowPaletteItem, FlowPoint, FlowSelection } from "./flow-editor.logic.js";
export type { FlowEditorProps } from "./flow-editor.shared.js";
