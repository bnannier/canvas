import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Autocomplete } from "../src/atoms/autocomplete/autocomplete.tsx";
import { Select } from "../src/atoms/select/select.tsx";
import { RowMenu } from "../src/organisms/row-menu/row-menu.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";

// Escape / dismiss contract for overlays whose close behavior was previously
// untested.
//
// Autocomplete, Select, and RowMenu are anchored overlays that share the shared
// `useEscapeKey` hook: it binds a DOCUMENT-level `keydown` listener while open, so
// pressing Escape anywhere closes the panel. With no OverlayProvider mounted each
// renders its open panel INLINE (the AnchoredOverlay fallback), so the content is
// queryable directly.
//
// Drawer and ActionSheet are React Native Modals. react-native-web's Modal wires
// `onRequestClose` to a document `keyup` Escape listener, but only once the Modal
// has marked itself active (via its show animation's onAnimationEnd). A Drawer with
// a side/top edge uses animationType="none", so it activates synchronously and the
// real Escape -> onRequestClose path can be driven here. The bottom-anchored
// ActionSheet uses animationType="slide", whose activation waits on a CSS
// onAnimationEnd that never fires under happy-dom, so its Escape path can't be
// exercised headless; its equivalent scrim/Cancel dismiss path (the same setOpen
// target) is tested instead.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const escapeKeyDown = () => fireEvent.keyDown(document, { key: "Escape" });

describe("Autocomplete — Escape dismisses the option list", () => {
  it("opens via the chevron, then Escape closes the list", () => {
    ui(<Autocomplete options={["Apple", "Banana", "Cherry"]} />);
    // Closed initially: no option rows rendered.
    expect(screen.queryByText("Banana")).toBeNull();
    // The trailing chevron toggles the list open (no query -> all options show).
    fireEvent.click(screen.getByLabelText("Toggle options"));
    expect(screen.queryByText("Banana")).not.toBeNull();
    // Escape (document keydown, wherever focus is) closes it.
    escapeKeyDown();
    expect(screen.queryByText("Banana")).toBeNull();
  });
});

describe("Select — Escape dismisses the listbox", () => {
  it("opens via the trigger, then Escape closes the listbox", () => {
    const { container } = ui(<Select options={["Small", "Medium", "Large"]} placeholder="Choose a size" />);
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    fireEvent.click(screen.getByText("Choose a size"));
    expect(container.querySelector('[role="listbox"]')).not.toBeNull();
    escapeKeyDown();
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });
});

describe("RowMenu — Escape dismisses the menu", () => {
  it("opens via the ⋯ trigger, then Escape closes the menu", () => {
    ui(<RowMenu items={[{ label: "Rename" }, { label: "Delete", destructive: true }]} />);
    const trigger = screen.getByLabelText("More options");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Rename")).toBeNull();
    fireEvent.click(trigger);
    expect(screen.queryByText("Rename")).not.toBeNull();
    escapeKeyDown();
    expect(screen.queryByText("Rename")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("Drawer — Escape fires the Modal's onRequestClose", () => {
  it("closes on Escape (keyup -> onRequestClose), reporting through onOpenChange", () => {
    // A left-edge drawer uses animationType="none", so RNW's Modal activates
    // synchronously and its document keyup Escape listener is live.
    let openState: boolean | null = null;
    ui(
      <Drawer open left onOpenChange={(o) => { openState = o; }}>
        <Text>Drawer body</Text>
      </Drawer>,
    );
    expect(screen.getByText("Drawer body")).toBeDefined();
    // RNW's Modal listens on `keyup` (not keydown) for Escape, on `document` in the
    // bubble phase, so firing on a rendered element still reaches it. Fired on an
    // element (not `document`) so the event target has a tagName: RNW PressResponder's
    // document-level keyup handler dereferences event.target.tagName, and the Document
    // node has none.
    fireEvent.keyUp(screen.getByText("Drawer body"), { key: "Escape" });
    expect(openState).toBe(false);
  });
});

describe("ActionSheet — scrim/Cancel dismiss (Modal close path)", () => {
  it("closes via the Cancel row, reporting through onOpenChange", () => {
    // The slide-animated Modal never marks itself active under happy-dom (its
    // activation waits on a CSS onAnimationEnd that does not fire), so the true
    // keyup-Escape -> onRequestClose path can't be driven here. The Cancel row
    // hits the same setOpen(false) close target the scrim/back/Escape all share.
    let openState: boolean | null = null;
    ui(
      <ActionSheet
        open
        onOpenChange={(o) => { openState = o; }}
        actions={[{ label: "Take Photo", onPress: () => {} }]}
      />,
    );
    expect(screen.getByText("Take Photo")).toBeDefined();
    fireEvent.click(screen.getByText("Cancel"));
    expect(openState).toBe(false);
  });
});
