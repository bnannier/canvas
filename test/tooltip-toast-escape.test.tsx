import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Tooltip } from "../src/atoms/tooltip/tooltip.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { Toast, ToastProvider, useToast } from "../src/organisms/toast/toast.tsx";

// The v4 hand-off's keyboard tables (cv-kit-overlays.js, KB.tooltip and KB.toast):
// Escape hides an open tip without moving focus, and Escape dismisses the focused toast.
// Both go through the kit's one Escape owner (useEscapeLayer), so the key reaches the
// topmost open layer only.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider solid>{n}</ThemeProvider>);
const escape = (target: Element | Document = document) => act(() => { fireEvent.keyDown(target, { key: "Escape" }); });

describe("Tooltip: Escape hides an open tip", () => {
  it("hides a tip raised by keyboard focus and leaves focus on the trigger", () => {
    ui(<Tooltip label="Copy the link" trigger="Share" />);
    const trigger = screen.getByRole("button", { name: "Share" });
    act(() => { trigger.focus(); });
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByText("Copy the link")).not.toBeNull();
    escape(trigger);
    expect(screen.queryByText("Copy the link")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("hides the tip of an element trigger, the child keeping focus", () => {
    ui(<Tooltip label="Saves the draft"><Button>Save</Button></Tooltip>);
    const child = screen.getByRole("button", { name: "Save" });
    act(() => { child.focus(); });
    expect(screen.queryByText("Saves the draft")).not.toBeNull();
    escape(child);
    expect(screen.queryByText("Saves the draft")).toBeNull();
    expect(document.activeElement).toBe(child);
  });

  it("reports the close to a controlled owner", () => {
    const seen: boolean[] = [];
    function Controlled() {
      const [open, setOpen] = useState(true);
      return <Tooltip label="Controlled tip" trigger="Info" open={open} onOpenChange={(next) => { seen.push(next); setOpen(next); }} />;
    }
    ui(<Controlled />);
    expect(screen.queryByText("Controlled tip")).not.toBeNull();
    escape();
    expect(seen).toEqual([false]);
    expect(screen.queryByText("Controlled tip")).toBeNull();
  });

  it("closes before the overlay it sits in, which takes the next Escape", () => {
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <Popover open={open} onOpenChange={setOpen} trigger="Details">
          <Tooltip label="Inner tip" trigger="Hint" open />
          <Text>Popover body</Text>
        </Popover>
      );
    }
    // A controlled-open tip stays open through its own Escape; the popover still waits.
    ui(<Host />);
    expect(screen.queryByText("Popover body")).not.toBeNull();
    escape();
    expect(screen.queryByText("Popover body")).not.toBeNull();
  });

  it("installs nothing while closed, so Escape reaches the host overlay", () => {
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <Popover open={open} onOpenChange={setOpen} trigger="Details">
          <Tooltip label="Closed tip" trigger="Hint" />
          <Text>Popover body</Text>
        </Popover>
      );
    }
    ui(<Host />);
    escape();
    expect(screen.queryByText("Popover body")).toBeNull();
  });
});

describe("Toast: Escape dismisses the focused toast", () => {
  function Fire({ options }: { options: Parameters<ReturnType<typeof useToast>["toast"]>[0] }) {
    const { toast } = useToast();
    return (
      <Pressable accessibilityRole="button" onPress={() => toast(options)}>
        <Text>fire</Text>
      </Pressable>
    );
  }

  it("dismisses the toast holding focus and returns focus to where it came from", () => {
    ui(<ToastProvider><Fire options={{ message: "Archived", action: { label: "Undo", onPress: () => {} }, duration: 0 }} /></ToastProvider>);
    const fire = screen.getByRole("button", { name: "fire" });
    act(() => { fire.focus(); fireEvent.click(fire); });
    const undo = screen.getByRole("button", { name: "Undo" });
    act(() => { undo.focus(); });
    expect(document.activeElement).toBe(undo);
    escape(undo);
    expect(screen.queryByText("Archived")).toBeNull();
    expect(document.activeElement).toBe(fire);
  });

  it("leaves a toast the user is not in alone", () => {
    ui(<ToastProvider><Fire options={{ message: "Saved", duration: 0 }} /></ToastProvider>);
    const fire = screen.getByRole("button", { name: "fire" });
    act(() => { fire.focus(); fireEvent.click(fire); });
    escape(fire);
    expect(screen.queryByText("Saved")).not.toBeNull();
    expect(document.activeElement).toBe(fire);
  });

  it("dismisses only the focused one of a stack", () => {
    function Two() {
      const { toast } = useToast();
      useEffect(() => {
        toast({ message: "First", duration: 0 });
        toast({ message: "Second", duration: 0 });
      }, [toast]);
      return null;
    }
    ui(<ToastProvider><Two /></ToastProvider>);
    const dismissers = screen.getAllByRole("button", { name: "Dismiss" });
    act(() => { dismissers[1].focus(); });
    escape(dismissers[1]);
    expect(screen.queryByText("Second")).toBeNull();
    expect(screen.queryByText("First")).not.toBeNull();
  });

  it("calls a standalone toast's onDismiss when focus is inside it", () => {
    let dismissed = 0;
    ui(<Toast message="Standalone" onDismiss={() => { dismissed += 1; }} />);
    const x = screen.getByRole("button", { name: "Dismiss" });
    escape();
    expect(dismissed).toBe(0);
    act(() => { x.focus(); });
    escape(x);
    expect(dismissed).toBe(1);
  });
});
