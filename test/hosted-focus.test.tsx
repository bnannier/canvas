import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode, type ReactNode, type RefObject } from "react";
import { View } from "react-native";
import { Button } from "../src/atoms/button/button.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { AlertDialog } from "../src/molecules/alert-dialog/alert-dialog.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { OverlayProvider, Portal } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useDialogFocus, usePopoverFocus } from "../src/style/use-dialog-focus.ts";
import { layoutHostedEntrance } from "./entrance-layout.ts";

afterEach(cleanup);
const themed = (node: ReactNode) => <ThemeProvider>{node}</ThemeProvider>;
const ui = (node: ReactNode) => render(themed(node));
const focus = (node: HTMLElement) => act(() => node.focus());

function assertTrap(panel: HTMLElement) {
  const controls = [...panel.querySelectorAll<HTMLElement>('[role="button"]')];
  expect(controls.length).toBeGreaterThan(1);
  const first = controls[0];
  const last = controls[controls.length - 1];
  focus(last);
  fireEvent.keyDown(last, { key: "Tab" });
  expect(document.activeElement === first).toBe(true);
  fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
  expect(document.activeElement === last).toBe(true);
}

// Render the real hosted components. The original focus tests exercise the
// unhosted fallback, which attaches its panel before the open effect runs.
describe("hosted panel focus", () => {
  for (const Component of [Dialog, AlertDialog]) {
    it(`${Component.name} enters its portaled panel, traps Tab and restores on every close`, async () => {
      const role = Component === AlertDialog ? "alertdialog" : "dialog";
      ui(<OverlayProvider><Component overlay trigger="Open modal" title="Confirm" /></OverlayProvider>);
      const trigger = screen.getByRole("button", { name: "Open modal" });
      for (let opening = 0; opening < 2; opening += 1) {
        focus(trigger);
        fireEvent.click(trigger);
        const panel = await screen.findByRole(role);
        await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));
        assertTrap(panel);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        await waitFor(() => expect(screen.queryByRole(role)).toBeNull());
        expect(document.activeElement === trigger).toBe(true);
      }
    });
  }

  it("moves focus after a measured Popover mounts, leaves Tab free and restores its trigger", async () => {
    const measure = spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      // The provider occupies a full page; only the trigger is 160 by 32.
      const outlet = getComputedStyle(this).zIndex === "1000";
      const [x, y, width, height] = outlet ? [0, 0, 640, 800] : [10, 20, 160, 32];
      return { x, y, width, height, top: y, left: x, right: x + width, bottom: y + height, toJSON: () => ({}) };
    });
    try {
      ui(<OverlayProvider><Popover trigger="Details" title="Information" actionLabel="Done" /></OverlayProvider>);
      const trigger = screen.getByRole("button", { name: "Details" });
      focus(trigger);
      fireEvent.click(trigger);
      // The portal attaches concealed content first. Deliver the native card,
      // scrollport and content layouts before querying or operating its controls.
      const mountedPanel = await screen.findByRole("dialog", { hidden: true });
      layoutHostedEntrance(mountedPanel, { width: 260, height: 120 }, { width: 226, height: 86 });
      const panel = screen.getByRole("dialog");
      await waitFor(() => expect(document.activeElement === panel).toBe(true));
      const action = screen.getByRole("button", { name: "Done" });
      focus(action);
      // happy-dom does not implement the browser's Tab default action. A
      // noncancelled key event establishes that this nonmodal hook leaves it free.
      expect(fireEvent.keyDown(action, { key: "Tab" })).toBe(true);
      fireEvent.click(action);
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(document.activeElement === trigger).toBe(true);
    } finally {
      measure.mockRestore();
    }
  });

  it("never steals focus for an inline Popover", () => {
    const view = ui(<Button>Keep focus</Button>);
    const trigger = screen.getByRole("button", { name: "Keep focus" });
    focus(trigger);
    view.rerender(themed(<><Button>Keep focus</Button><Popover inline title="Static" actionLabel="Done" /></>));
    expect(document.activeElement === trigger).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

// Test the exported hook itself: consumers can retain a panel while closed,
// attach it later, replace it, or read the stable object ref's current member.
// Correcting only Canvas's component shells would leave that public API broken.
for (const [name, useFocus] of [
  ["modal", useDialogFocus],
  ["nonmodal", usePopoverFocus],
] as const) {
  describe(`${name} public focus ref`, () => {
    let observed: RefObject<View | null> | undefined;
    function Panel({ open, attached = true, identity = "panel", children }: {
      open: boolean;
      attached?: boolean;
      identity?: string;
      children?: ReactNode;
    }) {
      const ref = useFocus(open);
      observed = ref;
      return attached ? (
        <View key={identity} ref={ref} tabIndex={-1} testID="focus-panel">
          <Button>First</Button><Button>Last</Button>{children}
        </View>
      ) : null;
    }
    const page = (panel: ReactNode) => <><Button>Opener</Button>{panel}<Button>Elsewhere</Button></>;

    it("attaches late while open, keeps the object ref stable and restores on controlled close", () => {
      const view = ui(page(<Panel open={false} attached={false} />));
      const trigger = screen.getByRole("button", { name: "Opener" });
      const stableRef = observed;
      expect(typeof stableRef).toBe("object");
      expect(stableRef?.current).toBeNull();
      focus(trigger);
      view.rerender(themed(page(<Panel open attached={false} />)));
      expect(document.activeElement === trigger).toBe(true);
      view.rerender(themed(page(<Panel open />)));
      const panel = screen.getByTestId("focus-panel");
      expect(observed === stableRef).toBe(true);
      expect(observed?.current as unknown === panel).toBe(true);
      expect(document.activeElement === panel).toBe(true);
      if (name === "modal") assertTrap(panel);
      view.rerender(themed(page(<Panel open={false} />)));
      expect(document.activeElement === trigger).toBe(true);
      focus(screen.getByRole("button", { name: "Last" }));
      expect(fireEvent.keyDown(document.activeElement!, { key: "Tab" })).toBe(true);
    });

    it("does not enter a late panel when it closed before attachment", () => {
      const view = ui(page(<Panel open={false} attached={false} />));
      const trigger = screen.getByRole("button", { name: "Opener" });
      focus(trigger);
      view.rerender(themed(page(<Panel open attached={false} />)));
      view.rerender(themed(page(<Panel open={false} attached={false} />)));
      view.rerender(themed(page(<Panel open={false} />)));
      expect(document.activeElement === trigger).toBe(true);
    });

    it("does not briefly focus a panel attached by the same render that closes it", () => {
      const view = ui(page(<Panel open={false} attached={false} />));
      const trigger = screen.getByRole("button", { name: "Opener" });
      focus(trigger);
      view.rerender(themed(page(<Panel open attached={false} />)));
      let focusChanges = 0;
      const onFocus = () => { focusChanges += 1; };
      document.addEventListener("focusin", onFocus);
      try {
        view.rerender(themed(page(<Panel open={false} />)));
        expect(focusChanges).toBe(0);
        expect(document.activeElement === trigger).toBe(true);
      } finally {
        document.removeEventListener("focusin", onFocus);
      }
    });

    it("captures one restoration target before delayed attachment", () => {
      const view = ui(page(<Panel open={false} attached={false} />));
      const trigger = screen.getByRole("button", { name: "Opener" });
      focus(trigger);
      view.rerender(themed(page(<Panel open attached={false} />)));
      focus(screen.getByRole("button", { name: "Elsewhere" }));
      view.rerender(themed(page(<Panel open />)));
      expect(document.activeElement === screen.getByTestId("focus-panel")).toBe(true);
      view.rerender(themed(page(null)));
      expect(document.activeElement === trigger).toBe(true);
    });

    it("ignores duplicate attachment, restores on detach and retains its target across replacement", () => {
      const view = ui(page(<Panel open={false} />));
      const trigger = screen.getByRole("button", { name: "Opener" });
      focus(trigger);
      view.rerender(themed(page(<Panel open />)));
      const last = screen.getByRole("button", { name: "Last" });
      focus(last);
      act(() => { observed!.current = observed!.current; });
      expect(document.activeElement === last).toBe(true);
      view.rerender(themed(page(<Panel open attached={false} />)));
      expect(document.activeElement === trigger).toBe(true);
      expect(observed?.current).toBeNull();
      view.rerender(themed(page(<Panel open identity="replacement" />)));
      expect(document.activeElement === screen.getByTestId("focus-panel")).toBe(true);
      view.rerender(themed(page(null)));
      expect(document.activeElement === trigger).toBe(true);
    });

    it("survives StrictMode mount cleanup, unmount and reopen through Portal", async () => {
      const pageWithPortal = (visible: boolean) => (
        <StrictMode><OverlayProvider>
          <Button>Opener</Button>{visible ? <Portal><Panel open /></Portal> : null}
        </OverlayProvider></StrictMode>
      );
      const view = ui(pageWithPortal(false));
      const trigger = screen.getByRole("button", { name: "Opener" });
      for (let opening = 0; opening < 2; opening += 1) {
        focus(trigger);
        view.rerender(themed(pageWithPortal(true)));
        const panel = await screen.findByTestId("focus-panel");
        await waitFor(() => expect(document.activeElement === panel).toBe(true));
        if (name === "modal") assertTrap(panel);
        view.rerender(themed(pageWithPortal(false)));
        await waitFor(() => expect(screen.queryByTestId("focus-panel")).toBeNull());
        expect(document.activeElement === trigger).toBe(true);
      }
    });

    it("preserves a deliberate focus move outside when the panel closes", () => {
      const view = ui(page(<Panel open={false} />));
      focus(screen.getByRole("button", { name: "Opener" }));
      view.rerender(themed(page(<Panel open />)));
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      focus(elsewhere);
      view.rerender(themed(page(null)));
      expect(document.activeElement === elsewhere).toBe(true);
    });
  });
}

it("restores the page trigger when a parent unmounts with focus in its portaled child", async () => {
  function Child() {
    const ref = usePopoverFocus(true);
    return <Portal><View ref={ref} tabIndex={-1} testID="portaled-child"><Button>Child action</Button></View></Portal>;
  }
  function Parent({ child }: { child: boolean }) {
    const ref = useDialogFocus(true);
    return <Portal><View ref={ref} tabIndex={-1} testID="portaled-parent">
      <Button>Child trigger</Button>{child ? <Child /> : null}
    </View></Portal>;
  }
  const content = (visible: boolean, child = false) => <OverlayProvider>
    <Button>Opener</Button>{visible ? <Parent child={child} /> : null}
  </OverlayProvider>;
  const view = ui(content(false));
  const trigger = screen.getByRole("button", { name: "Opener" });
  focus(trigger);
  view.rerender(themed(content(true)));
  await screen.findByTestId("portaled-parent");
  focus(screen.getByRole("button", { name: "Child trigger" }));
  view.rerender(themed(content(true, true)));
  const child = await screen.findByTestId("portaled-child");
  await waitFor(() => expect(document.activeElement === child).toBe(true));
  view.rerender(themed(content(false)));
  await waitFor(() => expect(screen.queryByTestId("portaled-child")).toBeNull());
  expect(document.activeElement === trigger).toBe(true);
});

for (const strict of [false, true]) {
it(`preserves initially open nested focus and restoration (StrictMode=${strict})`, () => {
  function NestedPanel({ children, testID }: { children?: ReactNode; testID: string }) {
    const ref = useDialogFocus(true);
    return <View ref={ref} tabIndex={-1} testID={testID}>{children}</View>;
  }
  const content = (visible: boolean, childVisible = true) => {
    const body = <>
    <Button>Opener</Button>
    {visible ? <NestedPanel testID="parent">
      {childVisible ? <NestedPanel testID="child"><Button>First</Button><Button>Last</Button></NestedPanel> : null}
    </NestedPanel> : null}
    </>;
    return strict ? <StrictMode>{body}</StrictMode> : body;
  };
  const view = ui(content(false));
  const trigger = screen.getByRole("button", { name: "Opener" });
  focus(trigger);
  view.rerender(themed(content(true)));
  const child = screen.getByTestId("child");
  expect(document.activeElement === child).toBe(true);
  assertTrap(child);
  view.rerender(themed(content(true, false)));
  expect(document.activeElement === screen.getByTestId("parent")).toBe(true);
  view.rerender(themed(content(false)));
  expect(document.activeElement === trigger).toBe(true);
});
}
