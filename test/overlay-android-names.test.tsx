import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Typography } from "../src/atoms/typography/typography.android.tsx";
import { Row } from "../src/atoms/layout/layout.android.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.android.tsx";
import { Button } from "../src/atoms/button/button.android.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { Drawer as IOSDrawer } from "../src/organisms/drawer/drawer.ios.tsx";
import { Drawer as AndroidDrawer } from "../src/organisms/drawer/drawer.android.tsx";
import { Sidebar as AndroidSidebar } from "../src/organisms/sidebar/sidebar.android.tsx";
import { FilterPanel as AndroidFilterPanel } from "../src/organisms/filter-panel/filter-panel.android.tsx";
import { ActionSheet as AndroidActionSheet } from "../src/organisms/action-sheet/action-sheet.android.tsx";
import { Dialog as AndroidDialog } from "../src/organisms/dialog/dialog.android.tsx";
import { AlertDialog as AndroidAlertDialog } from "../src/molecules/alert-dialog/alert-dialog.android.tsx";
import { containerNames } from "./android-names.ts";
import { resizeViewport } from "./viewport.ts";

// On Android, React Native's accessibility delegate names a view nobody named after the
// text inside it whenever the view carries a role, a state, actions or labelledBy, and a
// Pressable always carries a state (see test/android-names.ts for the rule and its
// source). The Drawer used to wrap its panel in two such Pressables, a scrim that closed
// it and a press area that swallowed stray taps, so a footer holding a label over a
// labelled group (the docs' Palette row: a "Palette" title over the segmented group named
// "Palette") named the drawer panel and the whole window "Palette, Palette". These hold
// every drawer, sheet and dialog in the kit to the rule: no view that cannot take focus
// itself is named after a footer's (or any other) text it merely contains.

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider light solid>{node}</ThemeProvider>);

/** A drawer footer as the docs' Android menu drawer has it: a title over a labelled segmented group. */
function PaletteFooter() {
  return (
    <>
      <Typography small subtle>Palette</Typography>
      <Row snug alignCenter>
        <ButtonGroup segmented small accessibilityLabel="Palette" items={["Blush", "Mint"]} active={0} onSelect={() => {}} />
      </Row>
    </>
  );
}

describe("Android names inside the kit's overlays", () => {
  for (const [platform, Component] of [["web", Drawer], ["iOS", IOSDrawer], ["Android", AndroidDrawer]] as const) {
    for (const edge of ["left", "right", "bottom", "top"] as const) {
      it(`${platform} Drawer (${edge}): neither the window nor the panel is named after the content`, () => {
        const { container } = ui(
          <Component open {...{ [edge]: true }} onOpenChange={() => {}}>
            <Typography>Filters for the current view.</Typography>
            <PaletteFooter />
          </Component>,
        );
        expect(screen.getByRole("tablist", { name: "Palette" })).toBeDefined();
        expect(containerNames(container)).toEqual([]);
      });
    }
  }

  it("Android Sidebar drawer: the drawer is not named after its footer", () => {
    resizeViewport(375);
    const { container } = ui(
      <AndroidSidebar
        responsive
        open
        onOpenChange={() => {}}
        header={() => <Button ghost small>Canvas design system</Button>}
        footer={<PaletteFooter />}
        sections={[
          { id: "overview", items: [{ id: "intro", label: "Introduction" }] },
          { id: "atoms", title: "Atoms", collapsible: true, items: [{ id: "chip", label: "Chip" }, { id: "button", label: "Button" }] },
        ]}
      />,
    );
    expect(screen.getByRole("tablist", { name: "Palette" })).toBeDefined();
    expect(containerNames(container)).toEqual([]);
  });

  it("Android FilterPanel drawer: the drawer is not named after its group titles", () => {
    resizeViewport(375);
    const { container } = ui(
      <AndroidFilterPanel
        responsive
        open
        onOpenChange={() => {}}
        groups={[
          { title: "Status", options: [{ label: "Active", checked: true, count: "128" }, { label: "Archived", count: "2" }] },
          { title: "Schema", options: [{ label: "Default", count: "96" }] },
        ]}
      />,
    );
    expect(screen.getByText("Schema")).toBeDefined();
    expect(containerNames(container)).toEqual([]);
  });

  it("Android ActionSheet: the sheet and its dismiss target are not named after its title or rows", () => {
    const { container } = ui(
      <AndroidActionSheet open onOpenChange={() => {}} title="Share photo" message="Choose where to send it." actions={[{ label: "Messages", onPress: () => {} }]} />,
    );
    expect(screen.getByText("Choose where to send it.")).toBeDefined();
    expect(containerNames(container)).toEqual([]);
  });

  it("Android Dialog: no container is named after a footer of its own", () => {
    const { container } = ui(
      <AndroidDialog open onOpenChange={() => {}} dismissible accessibilityLabel="Rename project">
        <Typography>Pick a clear name.</Typography>
        <PaletteFooter />
      </AndroidDialog>,
    );
    expect(screen.getByRole("tablist", { name: "Palette" })).toBeDefined();
    expect(containerNames(container)).toEqual([]);
  });

  it("Android Dialog and AlertDialog: their action footers name no container", () => {
    // A name made of the footer's labels, in whole or in part, is the defect; the
    // footer's buttons name themselves.
    const fromFooter = (names: { name: string }[], labels: string[]) => names.filter(({ name }) => name.split(", ").some((part) => labels.includes(part)));
    const dialog = ui(<AndroidDialog open onOpenChange={() => {}} title="Issue a refund" description="Send the money back." confirmLabel="Refund" cancelLabel="Keep" />);
    expect(screen.getByRole("button", { name: "Keep" })).toBeDefined();
    expect(fromFooter(containerNames(dialog.container), ["Refund", "Keep"])).toEqual([]);
    dialog.unmount();
    const alert = ui(<AndroidAlertDialog open onOpenChange={() => {}} title="Delete file?" description="This cannot be undone." confirmLabel="Delete" cancelLabel="Cancel" />);
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
    expect(fromFooter(containerNames(alert.container), ["Delete", "Cancel"])).toEqual([]);
  });
});
