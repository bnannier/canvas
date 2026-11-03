import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { ANATOMY_ZOOM, AnatomyPart, AnatomyProvider, AnatomyScope, useAnatomyPart, withPartLayout, zoomRect, type AnatomyRect, type AnatomyRects, type AnatomyTarget } from "../src/style/anatomy.tsx";
import { Button } from "../src/atoms/button/button.tsx";

// The anatomy part registry (src/style/anatomy.tsx): a component registers the host node
// of each named part, and an AnatomyProvider reports every part's rectangle relative to
// its own box, for a docs Anatomy section to number. Outside a provider a part costs a
// context read and adds no node.

afterEach(cleanup);

// happy-dom lays nothing out and has no ResizeObserver, so RNW's onLayout never fires on
// its own: fire the handler RNW attaches to each host node, as a browser would on layout.
function fireLayouts(root: Element) {
  for (const node of [root, ...root.querySelectorAll("*")]) {
    const handler = (node as unknown as { __reactLayoutHandler?: (event: unknown) => void }).__reactLayoutHandler;
    if (typeof handler === "function") act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width: 0, height: 0 } }, timeStamp: 1 }));
  }
}
// RNW's measureLayout reports on a timer.
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 5)));

// A node whose measureLayout answers with a rectangle the test sets, relative to anything.
function fakeNode(rect: { x: number; y: number; width: number; height: number }) {
  return {
    rect,
    measureLayout(_root: unknown, onSuccess: (x: number, y: number, width: number, height: number) => void) {
      onSuccess(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    },
  };
}

let captured: Record<string, AnatomyTarget | undefined> = {};
function Probe({ name }: { name: string }) {
  captured[name] = useAnatomyPart(name);
  return null;
}

describe("the registry", () => {
  it("costs nothing outside a provider: no handlers, and AnatomyPart renders its child bare", () => {
    captured = {};
    const { container } = render(<><Probe name="Label" /><AnatomyPart name="Leading icon"><Text testID="icon">*</Text></AnatomyPart></>);
    expect(captured.Label).toBeUndefined();
    expect(screen.getByTestId("icon").parentElement).toBe(container);
    const own = () => {};
    expect(withPartLayout(undefined, own)).toBe(own);
  });

  it("reports each part's rectangle on its layout, once per change, and drops a part that leaves", async () => {
    captured = {};
    const reports: AnatomyRects[] = [];
    render(<AnatomyProvider onMeasure={(parts) => reports.push(parts)}><Probe name="Container" /><Probe name="Label" /></AnatomyProvider>);
    const container = fakeNode({ x: 0, y: 0, width: 120, height: 40 });
    const label = fakeNode({ x: 16, y: 10, width: 80, height: 20 });
    act(() => {
      captured.Container!.ref(container);
      captured.Label!.ref(label);
    });
    act(() => captured.Container!.onLayout());
    act(() => captured.Label!.onLayout());
    expect(reports.at(-1)).toEqual({ Container: { x: 0, y: 0, width: 120, height: 40 }, Label: { x: 16, y: 10, width: 80, height: 20 } });

    // The same rectangle again reports nothing; a moved one reports.
    const count = reports.length;
    act(() => captured.Label!.onLayout());
    expect(reports.length).toBe(count);
    label.rect = { x: 20, y: 10, width: 80, height: 20 };
    act(() => captured.Label!.onLayout());
    expect(reports.at(-1)!.Label).toEqual({ x: 20, y: 10, width: 80, height: 20 });

    // A part that leaves drops out once the detaching render has settled.
    act(() => captured.Label!.ref(null));
    await settle();
    expect(reports.at(-1)).toEqual({ Container: { x: 0, y: 0, width: 120, height: 40 } });
  });

  it("keeps a part whose ref callback is replaced, detached and attached again in one render", async () => {
    captured = {};
    const reports: AnatomyRects[] = [];
    render(<AnatomyProvider onMeasure={(parts) => reports.push(parts)}><Probe name="Item" /></AnatomyProvider>);
    const item = fakeNode({ x: 4, y: 8, width: 60, height: 20 });
    act(() => captured.Item!.ref(item));
    act(() => captured.Item!.onLayout());
    const count = reports.length;
    act(() => {
      captured.Item!.ref(null);
      captured.Item!.ref(item);
    });
    await settle();
    // No removal was reported, and the rectangle is still the part's.
    expect(reports.slice(count).every((r) => r.Item != null)).toBe(true);
    expect(reports.at(-1)!.Item).toEqual({ x: 4, y: 8, width: 60, height: 20 });
  });

  it("hands every render the same handlers for a name", () => {
    captured = {};
    const { rerender } = render(<AnatomyProvider><Probe name="Label" /></AnatomyProvider>);
    const first = captured.Label;
    rerender(<AnatomyProvider><Probe name="Label" /></AnatomyProvider>);
    expect(captured.Label).toBe(first);
  });
});

describe("the scope", () => {
  // A part belongs to the outermost component that names it: a component takes its
  // handlers, then renders its tree inside AnatomyScope, so a nested kit component's
  // same-named part never takes the outer component's number.
  function Outer({ children }: { children?: ReactNode }) {
    const label = useAnatomyPart("Label");
    captured.outer = label;
    return <AnatomyScope><AnatomyPart part={label}><Text>outer</Text></AnatomyPart>{children}</AnatomyScope>;
  }

  it("closes the registry to everything inside it", () => {
    captured = {};
    render(<AnatomyProvider><Outer><Probe name="Label" /><Probe name="Container" /></Outer></AnatomyProvider>);
    expect(captured.outer).toBeDefined();
    expect(captured.Label).toBeUndefined();
    expect(captured.Container).toBeUndefined();
  });

  it("measures an element below the scope with the handlers taken above it", async () => {
    captured = {};
    const reports: AnatomyRects[] = [];
    const { container } = render(<ThemeProvider light solid><AnatomyProvider onMeasure={(parts) => reports.push(parts)}><Outer><Button>Nested</Button></Outer></AnatomyProvider></ThemeProvider>);
    fireLayouts(container);
    await settle();
    // The nested Button's Container and Label are not registered; the outer Label is.
    expect(Object.keys(reports.at(-1) ?? {})).toEqual(["Label"]);
  });

  it("renders its children bare outside a provider", () => {
    captured = {};
    const { container } = render(<AnatomyScope><Text testID="t">bare</Text></AnatomyScope>);
    expect(screen.getByTestId("t").parentElement).toBe(container);
    const part = render(<AnatomyPart part={undefined}><Text testID="u">bare</Text></AnatomyPart>);
    expect(screen.getByTestId("u").parentElement).toBe(part.container);
  });
});

describe("the zoom", () => {
  it("is the hand-off's 1.6 (Component.dc.html line 412)", () => {
    expect(ANATOMY_ZOOM).toBe(1.6);
  });

  it("maps a layout-space rectangle about the inner box's centre: x' = cx + (x - cx) * s, w' = w * s", () => {
    // A 250 wide inner box at x 75 (a 400 wide root over 1.6), 40 tall at y 12: its centre is (200, 32).
    const inner: AnatomyRect = { x: 75, y: 12, width: 250, height: 40 };
    // The container fills the inner box: scaled about the centre it spans the root's 400.
    expect(zoomRect({ x: 75, y: 12, width: 250, height: 40 }, inner, 1.6)).toEqual({ x: 0, y: 0, width: 400, height: 64 });
    // A label 20 in from the inner's left edge lands 32 in from the root's.
    expect(zoomRect({ x: 95, y: 22, width: 80, height: 20 }, inner, 1.6)).toEqual({ x: 32, y: 16, width: 128, height: 32 });
    // At 1 the rectangle is itself.
    const rect = { x: 95, y: 22, width: 80, height: 20 };
    expect(zoomRect(rect, inner, 1)).toEqual(rect);
  });

  it("reports mapped rectangles and the root's box from a zoomed provider, and the raw ones unzoomed", async () => {
    captured = {};
    const reports: [AnatomyRects, AnatomyRect][] = [];
    const { container } = render(<AnatomyProvider zoomed onMeasure={(parts, box) => reports.push([parts, box])}><Probe name="Container" /></AnatomyProvider>);
    const root = container.firstElementChild as HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
    const inner = root.firstElementChild as HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
    const node = fakeNode({ x: 75, y: 12, width: 250, height: 40 });
    act(() => captured.Container!.ref(node));
    // The stage lays the root out 400 wide at (40, 128) in the well, then the inner box at the root's width over the zoom.
    act(() => root.__reactLayoutHandler!({ nativeEvent: { layout: { x: 40, y: 128, width: 400, height: 64 } }, timeStamp: 1 }));
    act(() => inner.__reactLayoutHandler!({ nativeEvent: { layout: { x: 75, y: 12, width: 250, height: 40 } }, timeStamp: 2 }));
    act(() => captured.Container!.onLayout());
    expect(reports.at(-1)).toEqual([{ Container: { x: 0, y: 0, width: 400, height: 64 } }, { x: 40, y: 128, width: 400, height: 64 }]);
    // The inner box is laid out at the root's width over the zoom, and the root reserves the inner height scaled.
    expect(inner.style.width).toBe("250px");
    expect(inner.style.transform).toContain("scale(1.6)");
    expect(root.style.height).toBe("64px");

    cleanup();
    captured = {};
    const plain: [AnatomyRects, AnatomyRect][] = [];
    const flat = render(<AnatomyProvider onMeasure={(parts, box) => plain.push([parts, box])}><Probe name="Container" /></AnatomyProvider>);
    const flatRoot = flat.container.firstElementChild as HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
    act(() => captured.Container!.ref(fakeNode({ x: 10, y: 0, width: 120, height: 40 })));
    act(() => flatRoot.__reactLayoutHandler!({ nativeEvent: { layout: { x: 40, y: 140, width: 400, height: 40 } }, timeStamp: 1 }));
    act(() => captured.Container!.onLayout());
    expect(plain.at(-1)).toEqual([{ Container: { x: 10, y: 0, width: 120, height: 40 } }, { x: 40, y: 140, width: 400, height: 40 }]);
  });
});

describe("Button's parts", () => {
  it("registers Container, Label, Leading icon, Trailing icon and Count badge, the hand-off's anatomy", async () => {
    const reports: AnatomyRects[] = [];
    const { container } = render(
      <ThemeProvider light solid>
        <AnatomyProvider onMeasure={(parts) => reports.push(parts)}>
          <Button testID="b" iconLeft={<Text>+</Text>} iconRight={<Text>v</Text>} count={3}>Save changes</Button>
        </AnatomyProvider>
      </ThemeProvider>,
    );
    fireLayouts(container);
    await settle();
    expect(Object.keys(reports.at(-1) ?? {}).sort()).toEqual(["Container", "Count badge", "Label", "Leading icon", "Trailing icon"]);
  });

  it("registers only the parts it renders", async () => {
    const reports: AnatomyRects[] = [];
    const { container } = render(<ThemeProvider light solid><AnatomyProvider onMeasure={(parts) => reports.push(parts)}><Button testID="b">Save</Button></AnatomyProvider></ThemeProvider>);
    fireLayouts(container);
    await settle();
    expect(Object.keys(reports.at(-1) ?? {}).sort()).toEqual(["Container", "Label"]);
  });

  it("renders its icons bare outside a provider", () => {
    render(<ThemeProvider light solid><Button testID="b" iconLeft={<Text testID="icon">+</Text>}>Save</Button></ThemeProvider>);
    const icon = screen.getByTestId("icon");
    expect(icon.parentElement).toBe(screen.getByText("Save").parentElement);
  });
});
