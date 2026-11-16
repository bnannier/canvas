import { afterEach, expect, it, mock } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Svg from "react-native-svg";
import { FlowEditor } from "../src/organisms/flow-editor/flow-editor.tsx";
import { FlowEditor as IOSFlowEditor } from "../src/organisms/flow-editor/flow-editor.ios.tsx";
import { FlowEditor as AndroidFlowEditor } from "../src/organisms/flow-editor/flow-editor.android.tsx";
import type { FlowEdge, FlowNode } from "../src/organisms/flow-editor/flow-editor.logic.ts";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

const nodes: FlowNode[] = [
  { id: "product", label: "Product", description: "Requirements", x: 0, y: 0 },
  { id: "design", label: "Design", x: 240, y: 0 },
  { id: "done", label: "Done", x: 480, y: 0 },
];

const edges: FlowEdge[] = [
  { id: "ready", from: "product", to: "design", label: "Ready" },
  { id: "finish", from: "design", to: "done" },
];

// RNW omits native actions/state from the DOM. Read the nearest component carrying
// those props above this exact card host, as the app-frame and QRCode suites do.
function host(card: HTMLElement): { props: Record<string, unknown> } {
  type Fiber = { memoizedProps: Record<string, unknown> | null; return: Fiber | null };
  const key = Object.keys(card).find((name) => name.startsWith("__reactFiber$"));
  if (key) for (let fiber: Fiber | null = (card as unknown as Record<string, Fiber>)[key]; fiber; fiber = fiber.return) {
    const props = fiber.memoizedProps;
    if (props?.testID === card.getAttribute("data-testid") && props.accessibilityActions) return { props };
  }
  throw new Error(`Missing native props for ${card.getAttribute("data-testid")}`);
}

// SVG is a no-op in the test harness. Inspect its props and its RN hiding host;
// native-only props must reach View, since Svg forwards them to the browser DOM.
function drawingProps(canvas: HTMLElement) {
  type Fiber = { type: unknown; memoizedProps: Record<string, unknown>; child: Fiber | null; sibling: Fiber | null; return: Fiber | null };
  const key = Object.keys(canvas).find((name) => name.startsWith("__reactFiber$"));
  if (!key) throw new Error("Missing canvas fiber");
  const pending = [(canvas as unknown as Record<string, Fiber>)[key].child];
  while (pending.length) {
    const fiber = pending.pop();
    if (!fiber) continue;
    if (fiber.type === Svg) {
      for (let parent = fiber.return; parent; parent = parent.return) {
        if (parent.memoizedProps.accessibilityElementsHidden) return { svg: fiber.memoizedProps, host: parent.memoizedProps };
      }
      throw new Error("Missing native host hiding the SVG drawing");
    }
    pending.push(fiber.child, fiber.sibling);
  }
  throw new Error("Missing SVG drawing");
}

it("names directed relationships, optional labels and rework at both endpoints", () => {
  const graph = [...edges, { id: "return", from: "done", to: "design", label: "Needs revision", rework: true }];
  const view = render(<ThemeProvider><FlowEditor label="Workflow" nodes={nodes} edges={graph} testID="flow" /></ThemeProvider>);
  expect(view.getByRole("button", { name: "Product, Requirements. Incoming: none. Outgoing: Product to Design, label: Ready." })).toBe(view.getByTestId("flow-node-product"));
  expect(view.getByTestId("flow-node-design").getAttribute("aria-label")).toBe(
    "Design. Incoming: Product to Design, label: Ready; Done to Design, label: Needs revision, rework. Outgoing: Design to Done.",
  );
  expect(view.getByTestId("flow-node-done").getAttribute("aria-label")).toBe(
    "Done. Incoming: Design to Done. Outgoing: Done to Design, label: Needs revision, rework.",
  );
});

it("updates names when connections, labels, descriptions or endpoints change", () => {
  const ui = (currentNodes: FlowNode[], currentEdges: FlowEdge[]) => <ThemeProvider><FlowEditor label="Workflow" nodes={currentNodes} edges={currentEdges} testID="flow" /></ThemeProvider>;
  const view = render(ui(nodes, edges));
  const renamed = nodes.map((node) => node.id === "design" ? { ...node, label: "Review", description: "Approval" } : node);
  view.rerender(ui(renamed, [{ id: "return", from: "design", to: "product", label: "Rejected", rework: true }]));
  expect(view.getByTestId("flow-node-product").getAttribute("aria-label")).toBe(
    "Product, Requirements. Incoming: Review to Product, label: Rejected, rework. Outgoing: none.",
  );
  expect(view.getByTestId("flow-node-design").getAttribute("aria-label")).toBe(
    "Review, Approval. Incoming: none. Outgoing: Review to Product, label: Rejected, rework.",
  );
  view.rerender(ui(renamed.filter((node) => node.id !== "design"), edges));
  expect(view.getByTestId("flow-node-product").getAttribute("aria-label")).toBe("Product, Requirements. Incoming: none. Outgoing: none.");
  expect(view.queryByTestId("flow-node-design")).toBeNull();
  expect(view.getByTestId("flow-node-done").getAttribute("aria-label")).toBe("Done. Incoming: none. Outgoing: none.");
});

it("ignores invalid endpoints and explicitly describes isolated nodes", () => {
  const invalid: FlowEdge[] = [
    { id: "missing-source", from: "missing", to: "product", label: "Hidden source" },
    { id: "missing-target", from: "product", to: "missing", label: "Hidden target", rework: true },
    { id: "both-missing", from: "missing", to: "other" },
  ];
  const view = render(<ThemeProvider><FlowEditor label="Workflow" nodes={nodes} edges={invalid} testID="flow" /></ThemeProvider>);
  for (const node of nodes) {
    expect(view.getByTestId(`flow-node-${node.id}`).getAttribute("aria-label")).toBe(
      `${node.label}${node.description ? `, ${node.description}` : ""}. Incoming: none. Outgoing: none.`,
    );
  }
});

it("retains cycles, self loops and every parallel connection without traversing the graph", () => {
  const graph: FlowEdge[] = [
    ...edges,
    { id: "parallel", from: "product", to: "design", label: "Urgent", rework: true },
    { id: "cycle", from: "design", to: "product" },
    { id: "self", from: "product", to: "product", label: "Retry", rework: true },
  ];
  const view = render(<ThemeProvider><FlowEditor readOnly label="Workflow" nodes={nodes} edges={graph} testID="flow" /></ThemeProvider>);
  expect(view.getByTestId("flow-node-product").getAttribute("aria-label")).toBe(
    "Product, Requirements. Incoming: Design to Product; Product to Product, label: Retry, rework. Outgoing: Product to Design, label: Ready; Product to Design, label: Urgent, rework; Product to Product, label: Retry, rework.",
  );
  expect(view.getByTestId("flow-node-design").getAttribute("aria-label")).toBe(
    "Design. Incoming: Product to Design, label: Ready; Product to Design, label: Urgent, rework. Outgoing: Design to Done; Design to Product.",
  );
});

for (const [platform, Editor] of [["web", FlowEditor], ["ios", IOSFlowEditor], ["android", AndroidFlowEditor]] as const) {
  it(`${platform} hides duplicate graph artwork while keeping relationships on readable nodes`, () => {
    const view = render(<ThemeProvider><Editor readOnly label="Workflow" nodes={nodes} edges={edges} testID="flow" /></ThemeProvider>);
    const { host: drawing, svg } = drawingProps(view.getByTestId("flow-canvas"));
    expect(drawing.accessible).toBe(false);
    expect(drawing.accessibilityElementsHidden).toBe(true);
    expect(drawing.importantForAccessibility).toBe("no-hide-descendants");
    expect(drawing["aria-hidden"]).toBe(true);
    expect(drawing.pointerEvents).toBe("none");
    expect(svg.accessible).toBeUndefined();
    expect(svg.accessibilityElementsHidden).toBeUndefined();
    expect(svg.importantForAccessibility).toBeUndefined();
    const caption = view.getByText("Ready").parentElement!;
    expect(caption.getAttribute("aria-hidden")).toBe("true");
    type Fiber = { memoizedProps: Record<string, unknown>; return: Fiber | null };
    const key = Object.keys(caption).find((name) => name.startsWith("__reactFiber$"))!;
    let native: Record<string, unknown> | undefined;
    for (let fiber: Fiber | null = (caption as unknown as Record<string, Fiber>)[key]; fiber; fiber = fiber.return) {
      if (fiber.memoizedProps.accessibilityElementsHidden) { native = fiber.memoizedProps; break; }
    }
    expect(native?.accessible).toBe(false);
    expect(native?.importantForAccessibility).toBe("no-hide-descendants");
    expect(native?.pointerEvents).toBe("none");
    const card = view.getByRole("button", { name: "Product, Requirements. Incoming: none. Outgoing: Product to Design, label: Ready." });
    expect(card.closest('[aria-hidden="true"]')).toBeNull();
  });

  it(`${platform} puts native and web names and selection semantics on the existing node host`, () => {
    const view = render(<ThemeProvider><Editor label="Workflow" nodes={nodes} edges={edges} selected={{ kind: "node", id: "design" }} testID="flow" /></ThemeProvider>);
    for (const node of nodes) {
      const card = view.getByTestId(`flow-node-${node.id}`);
      const native = host(card);
      expect(native.props.accessibilityLabel).toBe(card.getAttribute("aria-label"));
      expect(native.props["aria-label"]).toBe(native.props.accessibilityLabel);
      expect(native.props.accessibilityRole).toBe("button");
      expect(native.props.accessibilityState).toEqual({ selected: node.id === "design" });
      expect(native.props["aria-pressed"]).toBe(node.id === "design");
      expect(card.getAttribute("aria-pressed")).toBe(String(node.id === "design"));
      expect(card.hasAttribute("aria-selected")).toBe(false);
      expect(card.parentElement).toBe(view.getByTestId("flow-canvas"));
    }
  });

  it(`${platform} keeps read-only graph discovery and selection without editing controls or actions`, () => {
    const move = mock(() => {}), remove = mock(() => {}), connect = mock(() => {}), add = mock(() => {}), select = mock(() => {});
    const view = render(<ThemeProvider><Editor readOnly label="Workflow" nodes={nodes} edges={edges} testID="flow"
      palette={[{ id: "new", label: "New" }]} onMoveNode={move} onDelete={remove} onConnect={connect} onAddNode={add} onSelectionChange={select} /></ThemeProvider>);
    expect(view.queryByTestId("flow-toolbar")).toBeNull();
    const card = view.getByRole("button", { name: "Product, Requirements. Incoming: none. Outgoing: Product to Design, label: Ready." });
    for (const node of nodes) expect(view.queryByTestId(`flow-node-${node.id}-port`)).toBeNull();
    const native = host(card);
    expect(native.props.accessibilityActions).toEqual([{ name: "activate" }]);
    const action = native.props.onAccessibilityAction as (event: { nativeEvent: { actionName: string } }) => void;
    act(() => { action({ nativeEvent: { actionName: "activate" } }); });
    expect(select).toHaveBeenCalledWith({ kind: "node", id: "product" });
    expect(card.getAttribute("aria-pressed")).toBe("true");
    for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Backspace"]) fireEvent.keyDown(card, { key });
    for (const name of ["moveLeft", "moveRight", "moveUp", "moveDown", "delete"]) act(() => { action({ nativeEvent: { actionName: name } }); });
    fireEvent.keyDown(view.getByTestId("flow-canvas"), { key: "Delete" });
    expect(move).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
    fireEvent.keyDown(view.getByTestId("flow-node-design"), { key: "Enter" });
    expect(view.getByTestId("flow-node-design").getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(card, { key: " " });
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });
}
