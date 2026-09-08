import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, type ReactNode } from "react";
import { View } from "react-native";
import { Button } from "../src/atoms/button/button.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { AnchoredOverlay } from "../src/style/anchored-overlay.tsx";
import { Entrance } from "../src/style/entrance.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { hostedEntranceParts, layoutElement, layoutEntrance, layoutHostedEntrance } from "./entrance-layout.ts";

afterEach(cleanup);
const SIZE = { width: 240, height: 160 };
const themed = (node: ReactNode) => <ThemeProvider>{node}</ThemeProvider>;
const focus = (node: HTMLElement) => act(() => node.focus());

function Card({ open = true, onMount }: { open?: boolean; onMount: () => void }) {
  const trigger = useRef<View>(null);
  return <>
    <View ref={trigger}><Button>Card trigger</Button></View>
    <AnchoredOverlay open={open} onDismiss={() => {}} triggerRef={trigger} onCardMount={onMount}>
      <View testID="card-content"><Button>Card action</Button></View>
    </AnchoredOverlay>
  </>;
}

describe("anchored focus readiness", () => {
  it("waits for a positive finite size and notifies once across resize and rehold", () => {
    let mounts = 0;
    render(themed(<Card onMount={() => { mounts++; }} />));
    const content = screen.getByTestId("card-content");
    const entrance = content.closest('[aria-hidden="true"]')!;
    expect(mounts).toBe(0);
    expect(screen.queryByRole("button", { name: "Card action" })).toBeNull();
    for (const size of [{ width: 0, height: 160 }, { width: 240, height: NaN }]) {
      layoutElement(entrance, size);
      expect(mounts).toBe(0);
    }
    layoutElement(entrance, SIZE);
    expect(mounts).toBe(1);
    expect(screen.getByRole("button", { name: "Card action" })).toBeTruthy();
    layoutElement(entrance, { width: 280, height: 180 });
    layoutElement(entrance, { width: 0, height: 0 });
    expect(screen.queryByRole("button", { name: "Card action" })).toBeNull();
    layoutElement(entrance, SIZE);
    expect(mounts).toBe(1);
  });

  it("waits for the enclosing entrance and creates a new notification on reopen", () => {
    let mounts = 0;
    const page = (ready: boolean, open = true) => themed(
      <Entrance ready={ready}><Card open={open} onMount={() => { mounts++; }} /></Entrance>,
    );
    const view = render(page(false));
    layoutEntrance(screen.getByTestId("card-content"), SIZE);
    expect(mounts).toBe(0);
    view.rerender(page(true));
    expect(mounts).toBe(1);
    view.rerender(page(false));
    view.rerender(page(true));
    expect(mounts).toBe(1);
    view.rerender(page(true, false));
    view.rerender(page(true));
    expect(mounts).toBe(1);
    layoutEntrance(screen.getByTestId("card-content"), SIZE);
    expect(mounts).toBe(2);
  });

  it("does not notify when closed before its first layout", () => {
    let mounts = 0;
    const view = render(themed(<Card onMount={() => { mounts++; }} />));
    const content = screen.getByTestId("card-content");
    const entrance = content.closest('[aria-hidden="true"]')!;
    view.rerender(themed(<Card open={false} onMount={() => { mounts++; }} />));
    expect(entrance.isConnected).toBe(false);
    expect(mounts).toBe(0);
  });

  for (const entranceFirst of [true, false]) {
    it(`hosted card needs owner fitting and its own entrance size (entrance first=${entranceFirst})`, async () => {
      const measure = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        x: 0, y: 0, width: 640, height: 800,
        top: 0, left: 0, right: 640, bottom: 800, toJSON: () => ({}),
      } as DOMRect);
      try {
        let mounts = 0;
        render(themed(<OverlayProvider><Card onMount={() => { mounts++; }} /></OverlayProvider>));
        const content = await screen.findByTestId("card-content");
        const nodes = hostedEntranceParts(content);
        expect(mounts).toBe(0);
        if (entranceFirst) layoutElement(nodes.entrance, SIZE);
        else {
          layoutElement(nodes.viewport, SIZE);
          layoutElement(nodes.content, SIZE);
          layoutElement(nodes.card, SIZE);
        }
        expect(mounts).toBe(0);
        expect(screen.queryByRole("button", { name: "Card action" })).toBeNull();
        if (entranceFirst) {
          layoutElement(nodes.viewport, SIZE);
          layoutElement(nodes.content, SIZE);
          layoutElement(nodes.card, SIZE);
        } else layoutElement(nodes.entrance, SIZE);
        expect(mounts).toBe(1);
        expect(screen.getByRole("button", { name: "Card action" })).toBeTruthy();
      } finally { cleanup(); measure.mockRestore(); }
    });
  }
});

for (const hosted of [false, true]) {
  describe(`Popover ${hosted ? "hosted" : "fallback"} readiness`, () => {
    async function fixture() {
      const measure = hosted ? spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        x: 0, y: 0, width: 640, height: 800,
        top: 0, left: 0, right: 640, bottom: 800, toJSON: () => ({}),
      } as DOMRect) : undefined;
      const page = (open: boolean) => {
        const body = <><Button>Original opener</Button><Button>Elsewhere</Button>
          <Popover open={open} title="Information" onOpenChange={() => {}} actionLabel="Done" />
        </>;
        return themed(hosted ? <OverlayProvider>{body}</OverlayProvider> : body);
      };
      const view = render(page(false));
      const opener = screen.getByRole("button", { name: "Original opener" });
      focus(opener);
      view.rerender(page(true));
      // Inspect structural attachment only while it is intentionally hidden.
      const panel = await waitFor(() => {
        const node = document.querySelector<HTMLElement>('[role="dialog"]');
        expect(node).not.toBeNull();
        return node!;
      });
      const reveal = () => hosted ? layoutHostedEntrance(panel, SIZE) : layoutEntrance(panel, SIZE);
      return { view, page, panel, opener, reveal, restore: () => { cleanup(); measure?.mockRestore(); } };
    }

    it("captures the opener immediately and delays focus until layout commits", async () => {
      const f = await fixture();
      try {
        expect(document.activeElement).toBe(f.opener);
        expect(screen.queryByRole("dialog")).toBeNull();
        focus(screen.getByRole("button", { name: "Elsewhere" }));
        f.reveal();
        expect(screen.getByRole("dialog")).toBe(f.panel);
        expect(document.activeElement).toBe(f.panel);
        f.view.rerender(f.page(false));
        expect(document.activeElement).toBe(f.opener);
      } finally { f.restore(); }
    });

    it("keeps the opener focused when closed before layout, including a later reopen", async () => {
      const f = await fixture();
      try {
        f.view.rerender(f.page(false));
        expect(f.panel.isConnected).toBe(false);
        expect(document.activeElement).toBe(f.opener);
        f.view.rerender(f.page(true));
        const panel = await waitFor(() => {
          const node = document.querySelector<HTMLElement>('[role="dialog"]');
          expect(node).not.toBeNull();
          return node!;
        });
        expect(panel).not.toBe(f.panel);
        expect(document.activeElement).toBe(f.opener);
        if (hosted) layoutHostedEntrance(panel, SIZE);
        else layoutEntrance(panel, SIZE);
        expect(document.activeElement).toBe(screen.getByRole("dialog"));
      } finally { f.restore(); }
    });
  });
}

it("a nested Popover waits for its ancestor, retains focus through refits, and restores on close", () => {
  const page = (ready: boolean, open: boolean) => themed(<>
    <Button>Opener</Button>
    <Entrance ready={ready}><Popover open={open} title="Nested" actionLabel="Done" /></Entrance>
  </>);
  const view = render(page(false, false));
  const opener = screen.getByRole("button", { name: "Opener" });
  focus(opener);
  view.rerender(page(false, true));
  const panel = document.querySelector<HTMLElement>('[role="dialog"]')!;
  layoutEntrance(panel, SIZE);
  expect(document.activeElement).toBe(opener);
  view.rerender(page(true, true));
  expect(document.activeElement).toBe(panel);
  const done = screen.getByRole("button", { name: "Done" });
  focus(done);
  let moves = 0;
  const moved = () => { moves++; };
  document.addEventListener("focusin", moved);
  try {
    for (let cycle = 0; cycle < 2; cycle++) {
      view.rerender(page(false, true));
      view.rerender(page(true, true));
      expect(document.activeElement).toBe(done);
    }
    expect(moves).toBe(0);
  } finally { document.removeEventListener("focusin", moved); }
  fireEvent.keyDown(done, { key: "Tab" });
  view.rerender(page(true, false));
  expect(document.activeElement).toBe(opener);
});

it("preserves ancestor readiness when a Popover moves into the provider's sibling outlet", async () => {
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, width: 640, height: 800,
    top: 0, left: 0, right: 640, bottom: 800, toJSON: () => ({}),
  } as DOMRect);
  const page = (ready: boolean, open: boolean) => themed(<OverlayProvider>
    <Button>Opener</Button>
    <Entrance ready={ready}><Popover open={open} title="Portaled child" /></Entrance>
  </OverlayProvider>);
  try {
    const view = render(page(false, false));
    const opener = screen.getByRole("button", { name: "Opener" });
    focus(opener);
    view.rerender(page(false, true));
    const panel = await waitFor(() => {
      const node = document.querySelector<HTMLElement>('[role="dialog"]');
      expect(node).not.toBeNull();
      return node!;
    });
    layoutHostedEntrance(panel, SIZE);
    expect(document.activeElement).toBe(opener);
    view.rerender(page(true, true));
    await waitFor(() => expect(document.activeElement).toBe(panel));
    view.rerender(page(true, false));
    expect(document.activeElement).toBe(opener);
  } finally { cleanup(); measure.mockRestore(); }
});

it("notifies a portaled card once after its logical ancestor releases it", async () => {
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, width: 640, height: 800,
    top: 0, left: 0, right: 640, bottom: 800, toJSON: () => ({}),
  } as DOMRect);
  let mounts = 0;
  const page = (ready: boolean, open = true) => themed(<OverlayProvider>
    <Entrance ready={ready}><Card open={open} onMount={() => { mounts++; }} /></Entrance>
  </OverlayProvider>);
  try {
    const view = render(page(false));
    layoutHostedEntrance(await screen.findByTestId("card-content"), SIZE);
    expect(mounts).toBe(0);
    view.rerender(page(true));
    await waitFor(() => expect(mounts).toBe(1));
    view.rerender(page(false));
    view.rerender(page(true));
    expect(mounts).toBe(1);
    view.rerender(page(false, false));
    view.rerender(page(false));
    layoutHostedEntrance(await screen.findByTestId("card-content"), SIZE);
    expect(mounts).toBe(1);
    view.rerender(page(false, false));
    view.rerender(page(true, false));
    expect(mounts).toBe(1);
  } finally { cleanup(); measure.mockRestore(); }
});
