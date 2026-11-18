import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { Platform, Text } from "react-native";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Tooltip } from "../src/atoms/tooltip/tooltip.tsx";
import { EscapeLayerProvider, EscapeParticipation, useEscapeLayer, useInputEscapeBridge } from "../src/style/escape-layer.ts";
import { OverlayProvider, Portal } from "../src/style/portal.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(() => {
  cleanup();
  fireEvent.keyUp(document.body, { key: "Escape" });
});

const themed = (children: ReactNode) => <ThemeProvider solid>{children}</ThemeProvider>;
const escape = () => act(() => {
  fireEvent.keyDown(document.body, { key: "Escape" });
  fireEvent.keyUp(document.body, { key: "Escape" });
});

function LivePopover({ dismissed }: { dismissed: () => void }) {
  const [open, setOpen] = useState(true);
  return <Popover open={open} trigger="Live details" onOpenChange={next => { if (!next) dismissed(); setOpen(next); }}><Text>Live popover body</Text></Popover>;
}

describe("internal decorative Escape isolation", () => {
  it("lets a real outside overlay dismiss while an isolated controlled Tooltip remains visible", () => {
    let realDismissals = 0;
    let specimenDismissals = 0;
    render(themed(<>
      <LivePopover dismissed={() => realDismissals++} />
      <EscapeParticipation enabled={false}>
        <Tooltip open label="Decorative tip" trigger="Decorative hint" onOpenChange={() => specimenDismissals++} />
      </EscapeParticipation>
    </>));
    expect(screen.queryByText("Live popover body")).not.toBeNull();
    expect(screen.queryByText("Decorative tip")).not.toBeNull();
    escape();
    expect(realDismissals).toBe(1);
    expect(specimenDismissals).toBe(0);
    expect(screen.queryByText("Live popover body")).toBeNull();
    expect(screen.queryByText("Decorative tip")).not.toBeNull();
  });

  it("does not let a nested opt-in defeat isolation and registers again when the ancestor enables it", () => {
    let dismissals = 0;
    const tree = (enabled: boolean) => themed(<EscapeParticipation enabled={enabled}>
      <EscapeParticipation enabled>
        <Tooltip open label="Policy tip" trigger="Policy hint" onOpenChange={() => dismissals++} />
      </EscapeParticipation>
    </EscapeParticipation>);
    const view = render(tree(false));
    escape();
    expect(dismissals).toBe(0);
    view.rerender(tree(true));
    escape();
    expect(dismissals).toBe(1);
    view.rerender(tree(false));
    escape();
    expect(dismissals).toBe(1);
    expect(screen.queryByText("Policy tip")).not.toBeNull();
  });

  it("carries isolation through the real registry Portal's sibling outlet", () => {
    let realDismissals = 0;
    let specimenDismissals = 0;
    function TeleportedSpecimen() {
      const scope = useEscapeLayer(true, () => specimenDismissals++);
      return <Portal><EscapeLayerProvider scope={scope}>
        <EscapeParticipation enabled>
          <Tooltip open label="Teleported decorative tip" trigger="Teleported hint" onOpenChange={() => specimenDismissals++} />
        </EscapeParticipation>
      </EscapeLayerProvider></Portal>;
    }
    render(themed(<>
      <LivePopover dismissed={() => realDismissals++} />
      <OverlayProvider>
        <EscapeParticipation enabled={false}><TeleportedSpecimen /></EscapeParticipation>
      </OverlayProvider>
    </>));
    // The hosted tip waits for browser layout before painting its bubble in this
    // DOM harness. Its real controlled-open owner is already mounted in the
    // sibling outlet, as the trigger verifies; Escape must still ignore it.
    expect(screen.queryByRole("button", { name: "Teleported hint" })).not.toBeNull();
    escape();
    expect(realDismissals).toBe(1);
    expect(specimenDismissals).toBe(0);
  });

  it("does not bridge a disabled specimen's TextInput Escape into a real outside overlay", () => {
    let realDismissals = 0;
    render(themed(<LivePopover dismissed={() => realDismissals++} />));
    const bridge = renderHook(() => useInputEscapeBridge(undefined), {
      wrapper: ({ children }) => themed(<EscapeParticipation enabled={false}>{children}</EscapeParticipation>),
    });
    let prevented = false;
    act(() => bridge.result.current({ nativeEvent: { key: "Escape" }, preventDefault: () => { prevented = true; } } as never));
    expect(realDismissals).toBe(0);
    expect(prevented).toBe(false);
    escape();
    expect(realDismissals).toBe(1);
  });

  for (const runtime of ["ios", "android"] as const) {
    it(`${runtime}: suppresses native requests while isolated and honors committed reactivation`, () => {
      const select = spyOn(Platform, "select").mockImplementation(specifics =>
        runtime in specifics ? specifics[runtime] : "native" in specifics ? specifics.native : specifics.default,
      );
      try {
        let scope!: ReturnType<typeof useEscapeLayer>;
        let outside!: ReturnType<typeof useEscapeLayer>;
        let dismissed = 0;
        let outsideDismissed = 0;
        function Specimen() {
          scope = useEscapeLayer(true, () => dismissed++);
          return null;
        }
        function Outside() {
          outside = useEscapeLayer(true, () => outsideDismissed++);
          return null;
        }
        const tree = (enabled: boolean) => themed(<>
          <Outside />
          <EscapeParticipation enabled={enabled}><EscapeParticipation enabled><Specimen /></EscapeParticipation></EscapeParticipation>
        </>);
        const view = render(tree(false));
        const oldCallback = scope.onAccessibilityEscape;
        act(() => { scope.onAccessibilityEscape(); scope.onRequestClose(); });
        expect(dismissed).toBe(0);
        expect(outsideDismissed).toBe(0);
        view.rerender(tree(true));
        act(() => { oldCallback(); scope.onRequestClose(); });
        expect(dismissed).toBe(2);
        view.rerender(tree(false));
        act(() => { oldCallback(); scope.onRequestClose(); outside.onAccessibilityEscape(); });
        expect(dismissed).toBe(2);
        expect(outsideDismissed).toBe(1);
      } finally {
        cleanup();
        select.mockRestore();
      }
    });
  }
});
