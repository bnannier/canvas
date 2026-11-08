import { useState } from "react";
import { Button, Column, FlowEditor, Row, Typography, type FlowEdge, type FlowNode, type FlowSelection } from "@nannier/canvas";

// The FlowEditor harness: a stateful graph the editor edits, driver buttons that put it in
// each state, and readouts the checks read (selection, the last event, counts).
const START_NODES: FlowNode[] = [
  { id: "intake", label: "Intake", description: "Triage", x: 0, y: 96 },
  { id: "product", label: "Product", description: "Requirements", x: 240, y: 0 },
  { id: "design", label: "Design", description: "Mockups", x: 480, y: 0 },
  { id: "engineering", label: "Engineering", x: 720, y: 96 },
  { id: "done", label: "Done", x: 960, y: 96 },
];
const START_EDGES: FlowEdge[] = [
  { id: "intake-product", from: "intake", to: "product", label: "Feature" },
  { id: "intake-engineering", from: "intake", to: "engineering", label: "Bug" },
  { id: "product-design", from: "product", to: "design", label: "Ready" },
  { id: "design-engineering", from: "design", to: "engineering", label: "Ready" },
  { id: "engineering-design", from: "engineering", to: "design", label: "Contract changed", rework: true },
  { id: "engineering-done", from: "engineering", to: "done", label: "Review ready" },
];

export function FlowEditorBody() {
  const [nodes, setNodes] = useState(START_NODES);
  const [edges, setEdges] = useState(START_EDGES);
  const [selected, setSelected] = useState<FlowSelection | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [event, setEvent] = useState("none");
  const [added, setAdded] = useState(0);
  const reset = () => { setNodes(START_NODES); setEdges(START_EDGES); setSelected(null); setEvent("reset"); };
  return (
    <Column relaxed>
      <Row wrap>
        <Button outline testID="flow-reset" onPress={reset}>Reset graph</Button>
        <Button outline testID="flow-read-only" onPress={() => setReadOnly((v) => !v)}>{readOnly ? "Edit" : "Read only"}</Button>
        <Button outline testID="flow-empty" onPress={() => { setNodes([]); setEdges([]); setEvent("emptied"); }}>Empty graph</Button>
      </Row>
      <FlowEditor label="Harness workflow" testID="flow" nodes={nodes} edges={edges} readOnly={readOnly}
        palette={[{ id: "review", label: "Review" }, { id: "support", label: "Support" }]}
        selected={selected} onSelectionChange={setSelected}
        onMoveNode={(id, point) => { setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...point } : n))); setEvent(`move ${id} ${point.x},${point.y}`); }}
        onConnect={(from, to) => { setEdges((es) => [...es, { id: `${from}-${to}`, from, to }]); setEvent(`connect ${from}>${to}`); }}
        onAddNode={(kind, point) => {
          const id = `${kind}-${added + 1}`;
          setAdded((n) => n + 1);
          setNodes((ns) => [...ns, { id, label: kind === "review" ? "Review" : "Support", x: point.x, y: point.y }]);
          setEvent(`add ${id} ${point.x},${point.y}`);
        }}
        onDelete={(s) => {
          if (s.kind === "node") { setNodes((ns) => ns.filter((n) => n.id !== s.id)); setEdges((es) => es.filter((e) => e.from !== s.id && e.to !== s.id)); }
          else setEdges((es) => es.filter((e) => e.id !== s.id));
          setSelected(null);
          setEvent(`delete ${s.kind} ${s.id}`);
        }} />
      <Typography testID="flow-selection">Selected: {selected ? `${selected.kind} ${selected.id}` : "none"}</Typography>
      <Typography small muted testID="flow-event">Last event: {event}</Typography>
      <Typography small muted testID="flow-counts">Nodes: {nodes.length} · Edges: {edges.length}</Typography>
    </Column>
  );
}
