import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { FlowEditor, type FlowEdge, type FlowNode } from "../src/organisms/flow-editor/flow-editor.tsx";
import { fitFlowCamera, flowBounds, flowCanConnect, flowEdgeGeometry, flowFreeSpot, flowKeyMove, flowNodeAt, snapFlowPoint, FLOW_NODE_HEIGHT, FLOW_NODE_WIDTH } from "../src/organisms/flow-editor/flow-editor.logic.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

const nodes: FlowNode[] = [
  { id: "product", label: "Product", description: "Requirements", x: 0, y: 0 },
  { id: "design", label: "Design", x: 240, y: 0 },
];
const edges: FlowEdge[] = [{ id: "pd", from: "product", to: "design", label: "Ready" }];
afterEach(cleanup);

it("flow editor reports moves, connections, additions and deletions without owning the graph", () => {
  const move = mock(() => {});
  const connect = mock(() => {});
  const add = mock(() => {});
  const remove = mock(() => {});
  const view = render(<ThemeProvider><FlowEditor label="Workflow" nodes={nodes} edges={[]} testID="flow"
    palette={[{ id: "review", label: "Review" }]}
    onMoveNode={move} onConnect={connect} onAddNode={add} onDelete={remove} /></ThemeProvider>);
  const card = view.getByTestId("flow-node-product");
  expect(card.getAttribute("aria-label")).toBe("Product, Requirements");
  fireEvent.keyDown(card, { key: "ArrowRight" });
  expect(move).toHaveBeenCalledWith("product", { x: 24, y: 0 });
  fireEvent.keyDown(card, { key: "Delete" });
  expect(remove).toHaveBeenCalledWith({ kind: "node", id: "product" });
  fireEvent.click(view.getByRole("button", { name: "Add Review" }));
  expect(add).toHaveBeenCalledTimes(1);
  expect((add.mock.calls[0] as unknown[])[0]).toBe("review");
  // Nothing moved: the graph is the application's.
  expect(view.getByTestId("flow-node-product")).toBeTruthy();
  expect(connect).not.toHaveBeenCalled();
});

it("flow editor read only drops the toolbar and the ports", () => {
  const view = render(<ThemeProvider><FlowEditor readOnly label="Workflow" nodes={nodes} edges={edges} testID="flow" /></ThemeProvider>);
  expect(view.queryByTestId("flow-toolbar")).toBeNull();
  expect(view.queryByTestId("flow-node-product-port")).toBeNull();
  expect(view.getByLabelText("Workflow")).toBeTruthy();
});

it("flow editor geometry snaps, hit tests, fits and routes edges", () => {
  expect(snapFlowPoint({ x: 13, y: 37 })).toEqual({ x: 24, y: 48 });
  expect(flowNodeAt(nodes, { x: 250, y: 10 })?.id).toBe("design");
  expect(flowNodeAt(nodes, { x: 200, y: 10 })).toBeNull();
  expect(flowKeyMove(nodes[0], "ArrowUp")).toEqual({ x: 0, y: -24 });
  expect(flowKeyMove(nodes[0], "a")).toBeNull();
  expect(flowCanConnect(nodes, edges, "product", "design")).toBe(false);
  expect(flowCanConnect(nodes, edges, "design", "product")).toBe(true);
  expect(flowCanConnect(nodes, edges, "design", "missing")).toBe(false);
  const spot = flowFreeSpot(nodes, { x: FLOW_NODE_WIDTH / 2, y: FLOW_NODE_HEIGHT / 2 });
  expect(nodes.some((n) => Math.abs(n.x - spot.x) < FLOW_NODE_WIDTH && Math.abs(n.y - spot.y) < FLOW_NODE_HEIGHT)).toBe(false);
  // A small graph keeps its true size and is centred.
  const cam = fitFlowCamera(nodes, [], 1000, 600);
  expect(cam.k).toBe(1);
  expect(cam.tx + (240 + FLOW_NODE_WIDTH) / 2).toBeCloseTo(500);
  // The bounds take in a backward edge's loop below the cards.
  expect(flowBounds(nodes, [{ id: "dp", from: "design", to: "product" }])!.height).toBeGreaterThan(FLOW_NODE_HEIGHT * 1.5);
  expect(flowBounds(nodes)!.height).toBe(FLOW_NODE_HEIGHT);
  // A backward edge loops below both cards.
  const back = flowEdgeGeometry(nodes[1], nodes[0]);
  expect(back.d).toContain(`${FLOW_NODE_HEIGHT * 1.6}`);
  expect(back.tip).toEqual({ x: 0, y: FLOW_NODE_HEIGHT / 2 });
});
