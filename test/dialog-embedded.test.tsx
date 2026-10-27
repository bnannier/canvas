import { describe, it, expect, afterEach, mock, spyOn } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import type { ForwardedRef, ReactNode } from "react";
import { Pressable, Text, View, type ViewProps } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { OverlayProvider } from "../src/style/index.js";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { AlertDialog } from "../src/molecules/alert-dialog/alert-dialog.tsx";
import { Wizard } from "../src/organisms/wizard/wizard.tsx";
import { Button } from "../src/atoms/button/button.tsx";

// `embedded` shows an open Dialog, AlertDialog or Wizard as a specimen in a page (the
// docs catalogue and the section pages): it keeps its role and labelling but is not
// modal. It takes no focus on mount, traps no Tab, claims no aria-modal and ignores
// Escape, so a page of open specimens loads at the top with focus on the body. A
// dialog without `embedded`, or one opened by its `trigger`, stays a live modal.

afterEach(cleanup);

const page = (n: ReactNode) =>
  render(
    <ThemeProvider>
      <Pressable accessibilityRole="button" testID="before"><Text>Before</Text></Pressable>
      {n}
      <Pressable accessibilityRole="button" testID="after"><Text>After</Text></Pressable>
    </ThemeProvider>,
  );

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
const tabbablesOf = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("tabindex") !== "-1",
  );

// Record every accessibilityViewIsModal React Native receives, before react-native-web
// drops it: the iOS VoiceOver half of the modal claim.
function withViewIsModal(run: (values: unknown[]) => void) {
  const component = View as unknown as { render: (props: ViewProps, ref: ForwardedRef<unknown>) => ReactNode };
  const original = component.render;
  const values: unknown[] = [];
  const spy = spyOn(component, "render").mockImplementation((props, ref) => {
    if ("accessibilityViewIsModal" in props) values.push(props.accessibilityViewIsModal);
    return original(props, ref);
  });
  try {
    run(values);
  } finally {
    spy.mockRestore();
  }
}

const cases: { name: string; role: string; element: (embedded: boolean, onOpenChange: (open: boolean) => void) => ReactNode }[] = [
  {
    name: "Dialog",
    role: "dialog",
    element: (embedded, onOpenChange) => (
      <Dialog open embedded={embedded} onOpenChange={onOpenChange} dismissible title="Publish tokens?" description="Native skins are unaffected." />
    ),
  },
  {
    name: "AlertDialog",
    role: "alertdialog",
    element: (embedded, onOpenChange) => (
      <AlertDialog open embedded={embedded} onOpenChange={onOpenChange} destructive title="Delete project?" description="This cannot be undone." confirmLabel="Delete" />
    ),
  },
  {
    name: "Wizard",
    role: "dialog",
    element: (embedded, onOpenChange) => (
      <OverlayProvider>
        <Wizard open embedded={embedded} onOpenChange={onOpenChange} title="New workspace"
          steps={[{ label: "Basics" }, { label: "Brand" }]} current={1}
          previous={{ label: "Basics", onPress: () => {} }} actions={<Button primary>Continue</Button>}>
          <Text>Body</Text>
        </Wizard>
      </OverlayProvider>
    ),
  },
];

for (const { name, role, element } of cases) {
  describe(`${name} embedded`, () => {
    it("mounts without moving focus, keeps its role and name, and claims no aria-modal", () => {
      withViewIsModal((viewIsModal) => {
        const { container } = page(element(true, () => {}));
        const panel = container.querySelector(`[role="${role}"]`) as HTMLElement;
        expect(panel).not.toBeNull();
        expect(panel.getAttribute("aria-labelledby")).toBeTruthy();
        expect(document.activeElement).toBe(document.body);
        expect(container.querySelector('[aria-modal="true"]')).toBeNull();
        expect(viewIsModal.length).toBeGreaterThan(0);
        expect(viewIsModal.some(Boolean)).toBe(false);
      });
    });

    it("lets Tab leave the panel and ignores Escape", () => {
      const onOpenChange = mock((_open: boolean) => {});
      const { container } = page(element(true, onOpenChange));
      const panel = container.querySelector(`[role="${role}"]`) as HTMLElement;
      const inside = tabbablesOf(panel);
      expect(inside.length).toBeGreaterThan(0);
      const last = inside[inside.length - 1];
      act(() => last.focus());
      // An untrapped Tab is left to the browser: not cancelled, focus not wrapped.
      expect(fireEvent.keyDown(last, { key: "Tab" })).toBe(true);
      expect(document.activeElement).toBe(last);
      act(() => inside[0].focus());
      expect(fireEvent.keyDown(inside[0], { key: "Tab", shiftKey: true })).toBe(true);
      expect(document.activeElement).toBe(inside[0]);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(container.querySelector(`[role="${role}"]`)).not.toBeNull();
    });

    it("without embedded, still moves focus in, traps Tab and claims aria-modal", () => {
      withViewIsModal((viewIsModal) => {
        const onOpenChange = mock((_open: boolean) => {});
        const { container } = page(element(false, onOpenChange));
        const panel = container.querySelector(`[role="${role}"]`) as HTMLElement;
        expect(panel.closest('[aria-modal="true"]') ?? container.querySelector('[aria-modal="true"]')).not.toBeNull();
        expect(viewIsModal.some(Boolean)).toBe(true);
        expect(panel.contains(document.activeElement)).toBe(true);
        const inside = tabbablesOf(panel);
        const last = inside[inside.length - 1];
        act(() => last.focus());
        expect(fireEvent.keyDown(last, { key: "Tab" })).toBe(false);
        expect(document.activeElement).toBe(inside[0]);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
}

describe("embedded with a trigger", () => {
  it("is ignored: the trigger opens a live modal", () => {
    const { container, getByRole } = page(<Dialog embedded trigger="Open dialog" title="Live" description="Modal." />);
    fireEvent.click(getByRole("button", { name: "Open dialog" }));
    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("is ignored on AlertDialog too", () => {
    const { container, getByRole } = page(<AlertDialog embedded trigger="Delete…" title="Delete?" />);
    fireEvent.click(getByRole("button", { name: "Delete…" }));
    const panel = container.querySelector('[role="alertdialog"]') as HTMLElement;
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.contains(document.activeElement)).toBe(true);
  });
});
