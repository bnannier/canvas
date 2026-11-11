import { createFlowEditor } from "./flow-editor.shared.js";
import { iosSkin } from "./flow-editor.styles.js";
import { Button } from "../../atoms/button/button.ios.js";
import { Select } from "../../atoms/select/select.ios.js";

// No platform ships a node-graph editor, so the canvas and cards are the web look (the skin
// is the web skin); the toolbar composes the ios Button and Select. The literal .ios
// imports are required for the web docs three-up, where a barrel import resolves the web builds.
export const FlowEditor = createFlowEditor(iosSkin, { Button, Select });
export type { FlowEdge, FlowNode, FlowPaletteItem, FlowPoint, FlowSelection } from "./flow-editor.logic.js";
export type { FlowEditorProps } from "./flow-editor.shared.js";
