---
"@nannier/canvas": minor
---

Add FlowEditor, a new public organism: a node-graph editor with cards on a pannable, zoomable canvas joined by directed, labelled edges. Cards move by drag or arrow keys and snap to a grid, edges are drawn from a card's port or with the toolbar's From and To selects, palette entries add nodes by press or drag, and a read-only mode shows a graph without editing it. Minor justification: a new public component (FlowEditor) with its types (FlowNode, FlowEdge, FlowPaletteItem, FlowSelection, FlowPoint, FlowEditorProps), which Argus's Workflow section builds on. The docs derivation script also learns to carry components the v4 hand-off predates.
