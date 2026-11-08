import { createFlowEditor } from "./flow-editor.shared.js";
import { androidSkin } from "./flow-editor.styles.js";
import { Button } from "../../atoms/button/button.android.js";
import { Select } from "../../atoms/select/select.android.js";

// No platform ships a node-graph editor, so the canvas and cards are the shared look in this
// platform's corners; the toolbar composes the android Button and Select. The literal .android
// imports are required for the web docs three-up, where a barrel import resolves the web builds.
export const FlowEditor = createFlowEditor(androidSkin, { Button, Select });
export type { FlowEdge, FlowNode, FlowPaletteItem, FlowPoint, FlowSelection } from "./flow-editor.logic.js";
export type { FlowEditorProps } from "./flow-editor.shared.js";
