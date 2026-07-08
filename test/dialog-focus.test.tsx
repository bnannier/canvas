import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { AlertDialog } from "../src/molecules/alert-dialog/alert-dialog.tsx";

// Dialog + AlertDialog are modal: on the web they must move focus INTO the panel
// on open, TRAP Tab within it, dismiss on Escape, and RESTORE focus to the
// trigger on close (the biggest a11y gap the audit found). These tests exercise
// that DOM focus behavior through react-native-web (see useDialogFocus). The whole
// mechanism is guarded on `typeof document`, so it is inert on native / under SSR.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

// The panel's own focusable descendants, in DOM order (mirrors useDialogFocus).
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
const focusablesOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("tabindex") !== "-1",
  );

describe("Dialog focus management + keyboard (web a11y)", () => {
  it("moves focus into the panel on open and Escape closes it", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Delete file"
          description="This action cannot be undone."
          withBody
        />
      );
    }
    const { container } = ui(<Harness />);

    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    // Focus was pulled off the body and into the panel.
    expect(document.activeElement).not.toBe(document.body);
    expect(panel.contains(document.activeElement)).toBe(true);

    // Escape dismisses the modal (the panel unmounts).
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("traps Tab within the panel, wrapping last -> first and first -> last", () => {
    function Harness() {
      const [open] = useState(true);
      return <Dialog open={open} title="Confirm" description="Proceed?" withBody />;
    }
    const { container } = ui(<Harness />);
    const panel = container.querySelector('[role="dialog"]') as HTMLElement;
    const focusables = focusablesOf(panel);
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Tab off the last control wraps back to the first.
    act(() => last.focus());
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    // Shift+Tab off the first control wraps to the last.
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("returns focus to the trigger when it closes", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Pressable accessibilityRole="button" testID="opener" onPress={() => setOpen(true)}>
            <Text>Open</Text>
          </Pressable>
          <Dialog open={open} onOpenChange={setOpen} title="Hi" description="Body." />
        </>
      );
    }
    const { container } = ui(<Harness />);
    const opener = container.querySelector('[data-testid="opener"]') as HTMLElement;
    act(() => opener.focus());
    expect(document.activeElement).toBe(opener);

    fireEvent.click(opener); // opens; focus moves into the panel
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.activeElement).not.toBe(opener);

    fireEvent.keyDown(document, { key: "Escape" }); // closes; focus returns
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe("AlertDialog focus management + keyboard (web a11y)", () => {
  it("moves focus into the panel on open and Escape closes it", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete project?"
          description="This cannot be undone."
        />
      );
    }
    const { container } = ui(<Harness />);

    const panel = container.querySelector('[role="alertdialog"]') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    expect(panel.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });
});
