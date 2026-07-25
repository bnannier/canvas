import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";
import { createSidebarDrillDown } from "../src/organisms/sidebar/sidebar.drilldown.tsx";
import { webSkin } from "../src/organisms/sidebar/sidebar.styles.ts";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

const SECTIONS = [{ id: "a", title: "Group A", items: [{ id: "one", label: "One" }, { id: "two", label: "Two" }] }];

// A sidebar row is navigation, so the active row states itself with
// `aria-current="page"`. It must NOT use `aria-selected`: ARIA permits that only on
// roles that carry a selected state, never on `button`, so a browser discards it and
// the row reads as though nothing is active. Asserting the absence matters as much as
// the presence, because the invalid spelling is silent everywhere except an audit.
const activeRows = (container: HTMLElement) => container.querySelectorAll('[aria-current="page"]');

describe("Sidebar active matching", () => {
  it("matches active by item id (string)", () => {
    const { container } = ui(<Sidebar sections={SECTIONS} active="two" />);
    const selected = activeRows(container);
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("Two");
  });

  it("still matches active by label (back-compat)", () => {
    const { container } = ui(<Sidebar sections={SECTIONS} active="One" />);
    const selected = activeRows(container);
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("One");
  });

  it("matches the empty-string home slug id", () => {
    const { container } = ui(<Sidebar items={[{ id: "", label: "Home" }, { id: "x", label: "Other" }]} active="" />);
    const selected = activeRows(container);
    expect(selected.length).toBe(1);
    expect(selected[0].textContent).toContain("Home");
  });

  it("never marks a row with aria-selected, which is invalid on a button", () => {
    const { container } = ui(<Sidebar sections={SECTIONS} active="two" />);
    expect(container.querySelectorAll("[aria-selected]").length).toBe(0);
  });
});

describe("Sidebar collapse (mini icon-rail)", () => {
  it("hides row labels in the rail but keeps the accessible name", () => {
    ui(<Sidebar header={<Text>Brand</Text>} defaultCollapsed items={[{ id: "d", label: "Dashboard", icon: "home" }]} />);
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.getByLabelText("Dashboard")).toBeTruthy();
  });

  it("shows the collapse toggle only when collapsible, and fires onToggleCollapse", () => {
    let toggled = 0;
    const { rerender } = ui(<Sidebar header={<Text>Brand</Text>} items={[{ label: "X" }]} />);
    // Not collapsible: no toggle.
    expect(screen.queryByLabelText("Collapse sidebar")).toBeNull();
    rerender(
      <ThemeProvider>
        <Sidebar header={<Text>Brand</Text>} collapsible onToggleCollapse={() => { toggled += 1; }} items={[{ label: "X" }]} />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(toggled).toBe(1);
  });
});

describe("Sidebar accordion sections", () => {
  const ACC = [
    { id: "a", title: "Alpha", collapsible: true, items: [{ label: "a1" }] },
    { id: "b", title: "Beta", collapsible: true, items: [{ label: "b1" }] },
  ];

  it("collapsible section header carries aria-expanded and toggles open on press", () => {
    const { container } = ui(<Sidebar sections={ACC} />);
    const alpha = container.querySelector("[aria-expanded]");
    expect(alpha?.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("a1")).toBeNull();
    fireEvent.click(screen.getByText("Alpha"));
    expect(screen.getByText("a1")).toBeTruthy();
  });

  it("is one-open-at-a-time by default (opening one closes the other)", () => {
    ui(<Sidebar sections={ACC} defaultOpenSections="a" />);
    expect(screen.getByText("a1")).toBeTruthy();
    fireEvent.click(screen.getByText("Beta"));
    expect(screen.getByText("b1")).toBeTruthy();
    expect(screen.queryByText("a1")).toBeNull();
  });

  it("auto-opens the section that owns the active row", () => {
    ui(<Sidebar sections={ACC} active="b1" />);
    expect(screen.getByText("b1")).toBeTruthy();
    expect(screen.queryByText("a1")).toBeNull();
  });
});

describe("Sidebar shell slots", () => {
  it("renders the header and footer nodes", () => {
    ui(<Sidebar header={<Text>BrandRow</Text>} footer={<Text>FooterRow</Text>} items={[{ label: "X" }]} />);
    expect(screen.getByText("BrandRow")).toBeTruthy();
    expect(screen.getByText("FooterRow")).toBeTruthy();
  });
});

describe("Sidebar responsive rail (wide)", () => {
  const RESP = [
    { id: "over", items: [{ id: "home", label: "Home" }] },
    { id: "cat", title: "Category", collapsible: true, items: [{ id: "p1", label: "Page One" }] },
  ];
  // The test viewport is a fixed 1280 desktop (test/setup.ts stubs visualViewport), which is
  // above the lg breakpoint, so `responsive` renders the inline rail — never the drawer Modal.
  // The narrow drawer switch is exercised end-to-end in the running docs app.
  it("keeps the inline rail (no drawer Modal) at desktop width", () => {
    ui(<Sidebar responsive sections={RESP} />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });
});

describe("Sidebar narrow drill-down (SidebarDrillDown)", () => {
  // Drive the drill-down presentation directly (it is what the responsive drawer renders below
  // the breakpoint), sidestepping the fixed-1280 test viewport that can't reach the drawer path.
  const DrillDown = createSidebarDrillDown(webSkin);
  const GROUPS = [
    { section: { id: "over", items: [{ id: "home", label: "Home" }] }, key: "over", rows: [{ item: { id: "home", label: "Home" }, index: 0 }] },
    {
      section: { id: "cat", title: "Category", collapsible: true, items: [{ id: "p1", label: "Page One" }, { id: "p2", label: "Page Two" }] },
      key: "cat",
      rows: [{ item: { id: "p1", label: "Page One" }, index: 1 }, { item: { id: "p2", label: "Page Two" }, index: 2 }],
    },
  ];
  const drill = (extra?: Partial<{ onSelect: (i: { label: string }) => void; onRequestClose: () => void }>) =>
    ui(
      <DrillDown
        groups={GROUPS}
        activeIndex={-1}
        activeSectionKey={null}
        density="default"
        open
        onSelect={extra?.onSelect ?? (() => {})}
        onRequestClose={extra?.onRequestClose ?? (() => {})}
      />,
    );

  it("shows pinned rows + drill rows at the root, with section items hidden", () => {
    drill();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
    expect(screen.queryByText("Page One")).toBeNull();
  });

  it("drills into a section and pops back", () => {
    drill();
    fireEvent.click(screen.getByText("Category"));
    expect(screen.getByText("Page One")).toBeTruthy();
    const back = document.querySelector('[aria-label="Back to Category"]') as HTMLElement;
    expect(back).not.toBeNull();
    fireEvent.click(back);
    expect(screen.queryByText("Page One")).toBeNull();
    expect(screen.getByText("Category")).toBeTruthy();
  });

  it("selecting a leaf fires onSelect and requests close", () => {
    let picked: string | null = null;
    let closed = false;
    drill({ onSelect: (i) => { picked = i.label; }, onRequestClose: () => { closed = true; } });
    fireEvent.click(screen.getByText("Home"));
    expect(picked).toBe("Home");
    expect(closed).toBe(true);
  });
});
