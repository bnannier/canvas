# FlowEditor

A node-graph editor: cards placed freely on a pannable, zoomable canvas, joined by directed edges. Use it to let people shape a process, such as a delivery workflow whose edges carry conditions. The application owns the graph; FlowEditor draws the `nodes` and `edges` it is given and reports what the user asked for (`onMoveNode`, `onConnect`, `onAddNode`, `onDelete`, `onSelectionChange`).

Drag a card to move it (it snaps to the grid on release), drag from a card's right-hand port onto another card to connect them, and drag a palette entry onto the canvas to add a node. Drag the background to pan; the wheel, a pinch or the toolbar zoom buttons zoom, and Fit shows the whole graph. A rework edge, one that returns work upstream, is drawn dashed.

## Usage

```tsx
<Stateful initial={{
  nodes: [
    { id: "product", label: "Product", description: "Requirements", x: 0, y: 48 },
    { id: "design", label: "Design", description: "Mockups", x: 240, y: 48 },
    { id: "build", label: "Engineering", x: 480, y: 48 },
  ],
  edges: [
    { id: "e1", from: "product", to: "design", label: "Ready" },
    { id: "e2", from: "design", to: "build", label: "Ready" },
    { id: "e3", from: "build", to: "design", label: "Contract changed", rework: true },
  ],
}}>
  {(graph, setGraph) => (
    <FlowEditor label="Delivery workflow" nodes={graph.nodes} edges={graph.edges}
      palette={[{ id: "review", label: "Review" }]}
      onMoveNode={(id, point) => setGraph({ ...graph, nodes: graph.nodes.map((n) => n.id === id ? { ...n, ...point } : n) })}
      onConnect={(from, to) => setGraph({ ...graph, edges: [...graph.edges, { id: `${from}-${to}`, from, to, label: "Ready" }] })}
      onAddNode={(kind, point) => setGraph({ ...graph, nodes: [...graph.nodes, { id: `${kind}-${graph.nodes.length}`, label: "Review", ...point }] })}
      onDelete={(selection) => setGraph(selection.kind === "node"
        ? { nodes: graph.nodes.filter((n) => n.id !== selection.id), edges: graph.edges.filter((e) => e.from !== selection.id && e.to !== selection.id) }
        : { ...graph, edges: graph.edges.filter((e) => e.id !== selection.id) })} />
  )}
</Stateful>
```

## Variants

### Read only

Pass `readOnly` to show a graph without editing it: the toolbar, the ports and card drags are gone, while panning, zooming and selection stay, so a selected card or edge can drive a detail panel beside the editor.

```tsx
<FlowEditor readOnly label="Published workflow, version 2"
  nodes={[
    { id: "intake", label: "Intake", x: 0, y: 0 },
    { id: "product", label: "Product", x: 240, y: 0 },
    { id: "done", label: "Done", x: 480, y: 0 },
  ]}
  edges={[
    { id: "a", from: "intake", to: "product", label: "Triage chose Product" },
    { id: "b", from: "product", to: "done", label: "Ready" },
  ]} />
```

### Free placement

Cards snap to a 24-point grid by default. Pass `freePlacement` to keep them exactly where they are dropped.

```tsx
<FlowEditor freePlacement label="Sketch"
  nodes={[{ id: "a", label: "Start", x: 13, y: 7 }, { id: "b", label: "Finish", x: 251, y: 61 }]}
  edges={[{ id: "ab", from: "a", to: "b" }]} />
```

## Do & Don't

### Say what an edge means

**Do**: Label each edge with the condition it carries, so the graph reads without opening every edge.

```tsx
<FlowEditor readOnly label="Review routing"
  nodes={[{ id: "a", label: "Quality", x: 0, y: 0 }, { id: "b", label: "Operations", x: 240, y: 0 }]}
  edges={[{ id: "ab", from: "a", to: "b", label: "Review ready" }]} />
```

**Don't**: Leave edges unlabeled when several leave one card; the reader cannot tell which path a ticket takes.

```tsx
<FlowEditor readOnly label="Review routing"
  nodes={[{ id: "a", label: "Quality", x: 0, y: 0 }, { id: "b", label: "Operations", x: 240, y: -48 }, { id: "c", label: "Design", x: 240, y: 72 }]}
  edges={[{ id: "ab", from: "a", to: "b" }, { id: "ac", from: "a", to: "c" }]} />
```

## Accessibility

Every pointer action has a keyboard and screen-reader path. Each card is a focusable button named by its title and description that announces its selected state; the arrow keys move a focused card one grid step and Delete removes it, and VoiceOver and TalkBack offer the same as named actions (move left, right, up and down, delete). The toolbar's From and To selects with Connect join two cards without dragging a port; when the two are joined already the button reads Disconnect and removes that edge, the keyboard path to an edge. Each palette entry adds its node in view when pressed. The canvas itself takes focus: plus and minus zoom and 0 fits the graph. Edges are selected by pressing them or their label; Delete removes the selection.
