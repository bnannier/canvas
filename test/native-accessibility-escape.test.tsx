import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { memo, startTransition, StrictMode, Suspense, useState, type ReactNode } from "react";
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { Platform, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { EscapeLayerProvider, useEscapeLayer } from "../src/style/escape-layer.ts";

afterEach(cleanup);
type Scope = ReturnType<typeof useEscapeLayer>;
type Runtime = "ios" | "android";

function withRuntime(runtime: Runtime, run: () => void) {
  // Render the actual hook through RNW while selecting the native runtime path.
  // These tests invoke production callbacks, not VoiceOver or Android drivers.
  const select = spyOn(Platform, "select").mockImplementation(specifics =>
    runtime in specifics ? specifics[runtime] : "native" in specifics ? specifics.native : specifics.default,
  );
  try { run(); } finally { cleanup(); select.mockRestore(); }
}

function harness() {
  const calls: string[] = [];
  const scopes = new Map<string, Scope>();
  const renders = new Map<string, number>();
  const Owner = memo(function Owner({ name, active, version = "", children }: {
    name: string;
    active?: boolean;
    version?: string;
    children?: ReactNode;
  }) {
    renders.set(name, (renders.get(name) ?? 0) + 1);
    const [open, setOpen] = useState(true);
    const scope = useEscapeLayer(active ?? open, () => {
      calls.push(name + version);
      if (active === undefined) setOpen(false);
    });
    scopes.set(name, scope);
    return <EscapeLayerProvider scope={scope}>{children}</EscapeLayerProvider>;
  });
  const scope = (name: string) => {
    const result = scopes.get(name);
    if (!result) throw new Error(`Owner ${name} has not rendered`);
    return result;
  };
  const ui = (node: ReactNode) => <ThemeProvider light solid>{node}</ThemeProvider>;
  const mount = (node: ReactNode) => {
    const result = render(ui(node));
    return { ...result, rerender: (next: ReactNode) => result.rerender(ui(next)) };
  };
  return { calls, scopes, renders, Owner, scope, mount };
}

for (const runtime of ["ios", "android"] as const) describe(`${runtime} native escape ownership`, () => {
  it("closes an initially open child before its parent despite effect order", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="parent"><h.Owner name="child" /></h.Owner>);
    act(() => h.scope("parent").onAccessibilityEscape());
    expect(h.calls).toEqual(["child"]);
    act(() => h.scope("parent").onAccessibilityEscape());
    expect(h.calls).toEqual(["child", "parent"]);
  }));

  it("keeps distinct controlled-refusal requests independent and never falls through", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="parent"><h.Owner name="child" active /></h.Owner>);
    const callback = h.scope("parent").onAccessibilityEscape;
    act(() => callback());
    act(() => callback());
    act(() => h.scope("parent").onRequestClose());
    expect(h.calls).toEqual(["child", "child", "child"]);
    expect(h.renders.get("child")).toBe(1);
  }));

  it("ignores an inactive originating host instead of closing its active parent", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="parent"><h.Owner name="child" /></h.Owner>);
    const oldChild = h.scope("child");
    act(() => oldChild.onAccessibilityEscape());
    act(() => oldChild.onAccessibilityEscape());
    act(() => oldChild.onRequestClose());
    expect(h.calls).toEqual(["child"]);
    act(() => h.scope("parent").onRequestClose());
    expect(h.calls).toEqual(["child", "parent"]);
  }));

  it("keeps active descendants connected through inactive ancestors", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="root"><h.Owner name="inactive" active={false}><h.Owner name="leaf" /></h.Owner></h.Owner>);
    act(() => h.scope("inactive").onAccessibilityEscape());
    expect(h.calls).toEqual([]);
    act(() => h.scope("root").onRequestClose());
    expect(h.calls).toEqual(["leaf"]);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["leaf", "root"]);
  }));

  it("uses the same child-first owner for native key and Modal requests", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="root"><h.Owner name="child"><h.Owner name="leaf" /></h.Owner></h.Owner>);
    let prevented = 0;
    act(() => h.scope("root").onKeyPress({ nativeEvent: { key: "Escape" }, preventDefault: () => prevented++ }));
    expect(h.calls).toEqual(["leaf"]);
    expect(prevented).toBe(1);
    act(() => h.scope("root").onRequestClose());
    expect(h.calls).toEqual(["leaf", "child"]);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["leaf", "child", "root"]);
  }));

  it("honors a native editor's local Escape cancellation", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="root" />);
    act(() => h.scope("root").onKeyPress({ nativeEvent: { key: "Escape", defaultPrevented: true } }));
    act(() => h.scope("root").onKeyPress({ key: "Escape", defaultPrevented: true }));
    act(() => h.scope("root").onKeyPress({ key: "Enter" }));
    expect(h.calls).toEqual([]);
  }));

  it("orders siblings by opening, without changing order on an ordinary rerender", () => withRuntime(runtime, () => {
    const h = harness();
    const scene = (second: boolean, firstVersion: string) => <h.Owner name="root">
      <h.Owner name="first" active version={firstVersion} /><h.Owner name="second" active={second} />
    </h.Owner>;
    const view = h.mount(scene(false, ""));
    view.rerender(scene(true, ""));
    view.rerender(scene(true, "-updated"));
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["second"]);
    view.rerender(scene(false, "-updated"));
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["second", "first-updated"]);
  }));

  it("never chooses an active layer from an independent root", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<><h.Owner name="left"><h.Owner name="left-child" /></h.Owner>
      <h.Owner name="right"><h.Owner name="right-child" /></h.Owner></>);
    act(() => h.scope("left").onAccessibilityEscape());
    expect(h.calls).toEqual(["left-child"]);
    act(() => h.scope("right").onAccessibilityEscape());
    expect(h.calls).toEqual(["left-child", "right-child"]);
  }));

  it("keeps a child-host request within its own subtree even when a newer sibling is open", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<h.Owner name="root"><h.Owner name="first" active><h.Owner name="leaf" active /></h.Owner>
      <h.Owner name="second" active /></h.Owner>);
    act(() => h.scope("first").onAccessibilityEscape());
    expect(h.calls).toEqual(["leaf"]);
    act(() => h.scope("first").onRequestClose());
    expect(h.calls).toEqual(["leaf", "leaf"]);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["leaf", "leaf", "second"]);
  }));

  it("moves a whole committed subtree when only its ancestor reparents", () => withRuntime(runtime, () => {
    const h = harness();
    const leaf = <h.Owner name="leaf" active />;
    const branch = <h.Owner name="branch" active>{leaf}</h.Owner>;
    function Scene({ right }: { right: boolean }) {
      const a = useEscapeLayer(true, () => h.calls.push("root-a"));
      const b = useEscapeLayer(true, () => h.calls.push("root-b"));
      h.scopes.set("root-a", a);
      h.scopes.set("root-b", b);
      return <EscapeLayerProvider scope={right ? b : a}>{branch}</EscapeLayerProvider>;
    }
    const view = h.mount(<Scene right={false} />);
    const leafScope = h.scope("leaf");
    const leafRenders = h.renders.get("leaf");
    view.rerender(<Scene right />);
    expect(h.renders.get("leaf")).toBe(leafRenders);
    expect(h.scope("leaf")).toBe(leafScope);
    act(() => h.scope("root-a").onAccessibilityEscape());
    expect(h.calls).toEqual(["root-a"]);
    act(() => h.scope("root-b").onAccessibilityEscape());
    expect(h.calls).toEqual(["root-a", "leaf"]);
  }));

  it("cleans up an unmounted owner and handles a later reopening", () => withRuntime(runtime, () => {
    const h = harness();
    const view = h.mount(<h.Owner name="root"><h.Owner name="child" active /></h.Owner>);
    const previous = h.scope("child").onAccessibilityEscape;
    view.rerender(<h.Owner name="root" />);
    act(() => previous());
    expect(h.calls).toEqual([]);
    view.rerender(<h.Owner name="root"><h.Owner name="child" active /></h.Owner>);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["child"]);
    view.unmount();
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["child"]);
  }));

  it("survives StrictMode effect replay with one owner per request", () => withRuntime(runtime, () => {
    const h = harness();
    h.mount(<StrictMode><h.Owner name="root"><h.Owner name="child" /></h.Owner></StrictMode>);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["child"]);
    act(() => h.scope("root").onAccessibilityEscape());
    expect(h.calls).toEqual(["child", "root"]);
  }));

  it("keeps the committed cancellation policy while a newer render is suspended", () => withRuntime(runtime, () => {
    const h = harness();
    const pending = new Promise<never>(() => {});
    function Pending({ wait }: { wait: boolean }) {
      if (wait) throw pending;
      return null;
    }
    let transition: () => void = () => { throw new Error("Scene has not rendered"); };
    function Scene() {
      const [version, setVersion] = useState("-committed");
      transition = () => startTransition(() => setVersion("-pending"));
      return <Suspense fallback={<Text>Waiting</Text>}><h.Owner name="owner" active version={version}>
        <Text>{version}</Text><Pending wait={version === "-pending"} />
      </h.Owner></Suspense>;
    }
    h.mount(<Scene />);
    const initialRenders = h.renders.get("owner")!;
    act(() => transition());
    expect(h.renders.get("owner")!).toBeGreaterThan(initialRenders);
    expect(screen.getByText("-committed")).toBeDefined();
    expect(screen.queryByText("Waiting")).toBeNull();
    act(() => h.scope("owner").onAccessibilityEscape());
    expect(h.calls).toEqual(["owner-committed"]);
  }));

  it("does not register native owners with the document keyboard dispatcher", () => withRuntime(runtime, () => {
    const listener = spyOn(document, "addEventListener");
    try {
      const view = renderHook(() => useEscapeLayer(true, () => {}));
      expect(listener.mock.calls.filter(([type]) => type === "keydown" || type === "keyup")).toEqual([]);
      view.unmount();
    } finally { listener.mockRestore(); }
  }));
});
