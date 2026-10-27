import { describe, it, expect, afterEach } from "bun:test";
import { act, render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { FilterPanel } from "../src/organisms/filter-panel/filter-panel.tsx";
import { FilterPanel as FilterPanelIOS } from "../src/organisms/filter-panel/filter-panel.ios.tsx";
import { FilterPanel as FilterPanelAndroid } from "../src/organisms/filter-panel/filter-panel.android.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/organisms/filter-panel/filter-panel.styles.ts";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/index.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

const GROUPS = [
  { title: "Status", options: [{ label: "Open", value: "open" }, { label: "Closed", value: "closed" }] },
  { title: "Kind", options: [{ label: "Bug", value: "bug" }] },
];

describe("FilterPanel", () => {
  it("toggles an option uncontrolled and reports both the toggle and the full selection", () => {
    let selection: string[] | null = null;
    let last: [number, number, boolean] | null = null;
    ui(
      <FilterPanel
        groups={GROUPS}
        onSelectionChange={(s) => { selection = s; }}
        onChange={(g, o, n) => { last = [g, o, n]; }}
      />,
    );
    const open = screen.getByLabelText("Open");
    expect(open.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(open);
    expect(open.getAttribute("aria-checked")).toBe("true");
    expect(selection).toEqual(["open"]);
    expect(last).toEqual([0, 0, true]);
  });

  it("seeds from defaultValue and empties on Clear", () => {
    let selection: string[] | null = null;
    let cleared = false;
    ui(
      <FilterPanel
        groups={GROUPS}
        defaultValue={["open", "bug"]}
        onSelectionChange={(s) => { selection = s; }}
        onClear={() => { cleared = true; }}
      />,
    );
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("true");
    expect(screen.getByLabelText("Bug").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByText("Clear 2"));
    expect(cleared).toBe(true);
    expect(selection).toEqual([]);
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("false");
    // The hand-off shows the Clear action only while a filter is on.
    expect(screen.queryByText(/^Clear/)).toBeNull();
  });

  it("is controlled by value: the parent drives the checked rows", () => {
    let selection: string[] | null = null;
    const { rerender } = ui(
      <FilterPanel groups={GROUPS} value={["open"]} onSelectionChange={(s) => { selection = s; }} />,
    );
    const closed = screen.getByLabelText("Closed");
    expect(screen.getByLabelText("Open").getAttribute("aria-checked")).toBe("true");
    expect(closed.getAttribute("aria-checked")).toBe("false");
    // A toggle reports the full next set but does not self-update: the parent owns `value`.
    fireEvent.click(closed);
    expect(selection).toEqual(["open", "closed"]);
    expect(closed.getAttribute("aria-checked")).toBe("false");
    // Once the parent syncs `value`, the row reflects it.
    rerender(
      <ThemeProvider>
        <FilterPanel groups={GROUPS} value={["open", "closed"]} onSelectionChange={(s) => { selection = s; }} />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText("Closed").getAttribute("aria-checked")).toBe("true");
  });
});


for (const [platform, Component] of [["web", FilterPanel], ["ios", FilterPanelIOS], ["android", FilterPanelAndroid]] as const) {
  describe(`${platform} FilterPanel option accessibility`, () => {
    const groups = [{ title: "Status", options: [
      { label: "Active", value: "active", count: "128" },
      { label: "Archived", value: "archived", count: "42" },
    ] }];

    it("exposes one named checkbox and tab stop per option with inert visuals", () => {
      const { container, getAllByRole, getByRole } = ui(<Component groups={groups} />);
      expect(getAllByRole("checkbox")).toHaveLength(2);
      expect(container.querySelectorAll('[role="checkbox"]')).toHaveLength(2);
      for (const name of ["Active, 128", "Archived, 42"]) {
        const row = getByRole("checkbox", { name });
        expect(row.tabIndex).toBe(0);
        expect(row.querySelector('[tabindex], button, input, select, textarea, a[href], [contenteditable="true"]')).toBeNull();
        expect(row.querySelector('[aria-hidden="true"]')).not.toBeNull();
      }
    });

    it("toggles once on Space release and once on Enter, while retaining focus", () => {
      const changes: string[][] = [];
      const toggles: [number, number, boolean][] = [];
      const { getByRole } = ui(<Component groups={groups}
        onSelectionChange={(next) => changes.push(next)} onChange={(g, o, next) => toggles.push([g, o, next])} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      expect(fireEvent.keyDown(row, { key: " " })).toBe(false);
      fireEvent.keyDown(row, { key: " ", repeat: true });
      expect(changes).toEqual([]);
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([["active"]]);
      expect(toggles).toEqual([[0, 0, true]]);
      expect(row.getAttribute("aria-checked")).toBe("true");
      fireEvent.keyDown(row, { key: "Enter" });
      fireEvent.keyUp(row, { key: "Enter" });
      expect(changes).toEqual([["active"], []]);
      expect(toggles).toEqual([[0, 0, true], [0, 0, false]]);
      expect(row.getAttribute("aria-checked")).toBe("false");
      expect(document.activeElement).toBe(row);
    });

    it("uses one selection path for the visible label, count and row body", () => {
      const changes: string[][] = [];
      const { getByRole } = ui(<Component groups={groups} onSelectionChange={(next) => changes.push(next)} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      fireEvent.click(within(row).getByText("Active"));
      expect(changes).toEqual([["active"]]);
      fireEvent.click(within(row).getByText("128"));
      expect(changes).toEqual([["active"], []]);
      fireEvent.click(row);
      expect(changes).toEqual([["active"], [], ["active"]]);
      expect(getByRole("checkbox", { name: "Active, 128" })).toBe(row);
    });

    it("keeps a focused stable-value row and its held Space sequence through reordering", () => {
      const changes: string[][] = [];
      const toggles: [number, number, boolean][] = [];
      const view = (reversed: boolean) => <ThemeProvider><Component
        groups={[{ title: "Status", options: reversed ? [...groups[0].options].reverse() : groups[0].options }]}
        onSelectionChange={(next) => changes.push(next)} onChange={(g, o, next) => toggles.push([g, o, next])} /></ThemeProvider>;
      const { getByRole, rerender } = render(view(false));
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      fireEvent.keyDown(row, { key: " " });
      rerender(view(true));
      expect(getByRole("checkbox", { name: "Active, 128" })).toBe(row);
      expect(document.activeElement).toBe(row);
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([["active"]]);
      expect(toggles).toEqual([[0, 1, true]]);
      expect(row.getAttribute("aria-checked")).toBe("true");
    });

    it("cancels a held Space when focus leaves the row", () => {
      const changes: string[][] = [];
      const { getByRole } = ui(<Component groups={groups} onSelectionChange={(next) => changes.push(next)} />);
      const row = getByRole("checkbox", { name: "Active, 128" });
      act(() => row.focus());
      fireEvent.keyDown(row, { key: " " });
      act(() => getByRole("checkbox", { name: "Archived, 42" }).focus());
      fireEvent.keyUp(row, { key: " " });
      expect(changes).toEqual([]);
    });
  });
}

// The panel is the v4 hand-off's (cv-kit-inputs.js `K.def('filter-panel')`) on every
// platform; only the option rows differ per OS.
describe("FilterPanel follows the v4 hand-off", () => {
  const t = lightColors;
  it("is the 280 rail at the 14px corner, a field-border hairline over the card fill", () => {
    for (const skin of [webSkin, iosSkin, androidSkin]) {
      expect(skin.panelBase).toMatchObject({ width: 280 });
      expect(skin.borderedSurface(t)).toEqual({ borderRadius: 14, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.card });
      expect(skin.panelPad).toEqual({ compact: { padding: 12 }, base: { padding: 16 } });
      expect(skin.panelStack).toEqual({ compact: { gap: 10 }, base: { gap: 14 } });
      expect(skin.groupGap).toEqual({ compact: { gap: 4 }, base: { gap: 8 } });
    }
  });
  it("sets the title in 600 14px, the group heading as the 500 11px mono eyebrow and the counts in 400 12px mono, both subtle", () => {
    for (const c of [lightColors, darkColors]) {
      expect(webSkin.titleText(c)).toMatchObject({ fontSize: 14, fontWeight: "600", color: c.foreground });
      expect(webSkin.groupTitle(c)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 11, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", color: c["subtle-foreground"] });
      expect(webSkin.countText(c)).toMatchObject({ fontFamily: MONO_FONT, fontSize: 12, fontWeight: "400", color: c["subtle-foreground"] });
    }
  });
  it("spaces a web row 10 from its count and its rows 8 apart (4 compact)", () => {
    expect(webSkin.optionRow).toMatchObject({ flexDirection: "row", alignItems: "center", gap: 10 });
    expect(webSkin.optionGap).toEqual({ compact: { gap: 4 }, base: { gap: 8 } });
    expect(webSkin.optionRow.minHeight).toBeUndefined();
  });
  it("keeps the native rows at the platform touch heights, the iOS trailing check and the Android ripple", () => {
    expect(iosSkin.optionRow.minHeight).toBe(44);
    expect(androidSkin.optionRow.minHeight).toBe(48);
    expect(iosSkin.optionMark.kind).toBe("trailing");
    expect(androidSkin.optionMark.kind).toBe("indicator");
    expect(androidSkin.rowRipple).not.toBeNull();
    expect(webSkin.rowPressedOpacity).toBeNull();
  });
  it("renders the counts as text, not badges, and the header Clear as the live count", () => {
    ui(<FilterPanel groups={[{ title: "Status", options: [{ label: "Active", count: "18", checked: true }, { label: "Invited", count: "4" }] }]} />);
    expect(screen.getByText("18").getAttribute("style") ?? "").toContain("12px");
    expect(screen.getByText("Clear 1")).toBeTruthy();
  });
});
