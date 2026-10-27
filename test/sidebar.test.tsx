import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";
import { createSidebarDrillDown } from "../src/organisms/sidebar/sidebar.drilldown.tsx";
import { webSkin } from "../src/organisms/sidebar/sidebar.styles.ts";
import { resizeViewport } from "./viewport.ts";
import { colorsFor } from "../src/style/tokens.ts";
import { Input } from "../src/atoms/input/input.tsx";
import { Column } from "../src/atoms/layout/layout.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";

// A colour's channels and alpha, so "#b5b0ff", "rgb(181, 176, 255)" and "rgba(181, 176, 255, 1.00)" compare equal.
const paint = (color: string) => {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1, 7), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1].join(",");
  }
  const [r, g, b, a = "1"] = color.replace(/^rgba?\(|\)$/g, "").split(",").map((v) => v.trim());
  return [r, g, b, String(Number(a))].join(",");
};

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

// The rendered badge pill for a count: the label Text has no element children, so its
// parent is the Badge root. Comparing that root's markup against a standalone Badge is
// what pins the tone: the pill's fill, border, dot and label color all ride inline
// styles, and an approximate assertion would not catch a swap between the two families.
const badgeHtml = (root: HTMLElement, count: string) =>
  [...root.querySelectorAll<HTMLElement>("div")].find((el) => el.textContent === count && el.childElementCount === 0)?.parentElement?.outerHTML;

// The same measurement taken on a bare Badge, as the reference to match.
const badgeReference = (node: ReactNode) => {
  const html = ui(node).container.firstElementChild?.outerHTML;
  cleanup();
  return html;
};

describe("Sidebar item badges", () => {
  it("renders a plain web count as the small quiet count pill", () => {
    const reference = badgeReference(<Badge secondary count>3</Badge>);
    const { container } = ui(<Sidebar items={[{ id: "inbox", label: "Inbox", badge: "3" }]} />);
    expect(reference).toBeTruthy();
    expect(badgeHtml(container, "3")).toBe(reference);
  });

  it("renders a badgeError count as the Badge error status pill", () => {
    const reference = badgeReference(<Badge status error>3</Badge>);
    const { container } = ui(<Sidebar items={[{ id: "sec", label: "Security", badge: "3", badgeError: true }]} />);
    expect(reference).toBeTruthy();
    expect(badgeHtml(container, "3")).toBe(reference);
  });

  it("ignores badgeError on a row that carries no count", () => {
    const plain = ui(<Sidebar items={[{ id: "sec", label: "Security" }]} />).container.innerHTML;
    cleanup();
    const flagged = ui(<Sidebar items={[{ id: "sec", label: "Security", badgeError: true }]} />).container.innerHTML;
    expect(flagged).toBe(plain);
  });

  it("still folds the count into the collapsed rail's accessible name", () => {
    ui(<Sidebar header={<Text>Brand</Text>} defaultCollapsed items={[{ id: "sec", label: "Security", icon: "shield", badge: "3", badgeError: true }]} />);
    expect(screen.queryByText("Security")).toBeNull();
    expect(screen.getByLabelText("Security, 3")).toBeTruthy();
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
  // The default test viewport is a 1280 desktop (test/setup.ts stubs visualViewport), above
  // the lg breakpoint, so `responsive` renders the inline rail — never the drawer Modal.
  it("keeps the inline rail (no drawer Modal) at desktop width", () => {
    ui(<Sidebar responsive sections={RESP} />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });

  it("switches to the drawer at a phone-width viewport (rail rows unmount)", () => {
    ui(<Sidebar responsive sections={RESP} />);
    resizeViewport(375);
    // Closed drawer: nothing renders until the consumer's hamburger opens it.
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("opens the drill-down drawer when `open` at a phone-width viewport", () => {
    resizeViewport(375);
    ui(<Sidebar responsive open sections={RESP} />);
    // Drill-down root: pinned rows and the section drill row show; section items
    // stay behind the drill.
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Category")).toBeTruthy();
    expect(screen.queryByText("Page One")).toBeNull();
  });

  it("returns to the inline rail when the viewport widens back", () => {
    ui(<Sidebar responsive sections={RESP} />);
    resizeViewport(375);
    expect(screen.queryByText("Home")).toBeNull();
    resizeViewport(1280);
    expect(screen.getByText("Home")).toBeTruthy();
  });
});

describe("Sidebar narrow drill-down (SidebarDrillDown)", () => {
  // Drive the drill-down presentation directly (it is what the responsive drawer renders below
  // the breakpoint), sidestepping the fixed-1280 test viewport that can't reach the drawer path.
  // Built the way createSidebar builds it: the web skin with the web Badge part.
  const DrillDown = createSidebarDrillDown(webSkin, Badge);
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

  it("paints a leaf row's badgeError count in the same Badge error status tone as the rail", () => {
    const item = { id: "sec", label: "Security", badge: "7", badgeError: true };
    const reference = badgeReference(<Badge status error>7</Badge>);
    const { container } = ui(
      <DrillDown
        groups={[{ section: { id: "admin", items: [item] }, key: "admin", rows: [{ item, index: 0 }] }]}
        activeIndex={-1}
        activeSectionKey={null}
        density="default"
        open
        onSelect={() => {}}
        onRequestClose={() => {}}
      />,
    );
    expect(reference).toBeTruthy();
    expect(badgeHtml(container, "7")).toBe(reference);
  });
});

it("embedded navigation inherits the host rail's bounds, with the hand-off rail's spacing", () => {
  ui(<Sidebar embedded compact sections={[{ title: "Controls", items: [{ id: "button", label: "Button" }] }]} active="button" />);
  const nav = screen.getByRole("navigation");
  expect(nav.style.width).toBe("");
  expect(nav.style.backgroundColor).toBe("");
  expect(nav.style.gap).toBe("16px");
  const row = screen.getByRole("button", { name: "Button" });
  expect(row.style.height).toBe("30px");
  expect(row.style.borderRadius).toBe("8px");
  expect(row.style.paddingLeft).toBe("10px");
  expect(row.style.paddingRight).toBe("10px");
});

describe("Sidebar v4 web rail", () => {
  const tokens = colorsFor("violet", "dark");
  const dark = (node: ReactNode) => render(<ThemeProvider dark solid>{node}</ThemeProvider>);
  const rowOf = (label: string) => screen.getByText(label).closest("[tabindex]") as HTMLElement;
  // The trailing marker is the row's last child, a 5 px dot.
  const markerOf = (label: string) => {
    const last = rowOf(label).lastElementChild as HTMLElement;
    return last.style.width === "5px" ? last : null;
  };

  it("draws the default renderer's 36 px row at the 9 px corner, and the compact rail's 30 px row at 8", () => {
    dark(<Sidebar items={[{ label: "Overview" }]} />);
    expect(rowOf("Overview").style.height).toBe("36px");
    expect(rowOf("Overview").style.borderRadius).toBe("9px");
    cleanup();
    dark(<Sidebar compact items={[{ label: "Overview" }]} />);
    expect(rowOf("Overview").style.height).toBe("30px");
    expect(rowOf("Overview").style.borderRadius).toBe("8px");
  });

  it("paints the active row on the accent's soft wash in its text ink, with no edge bar", () => {
    dark(<Sidebar compact defaultActive="Button" items={[{ label: "Button" }, { label: "Switch" }]} />);
    const row = rowOf("Button");
    expect(row.style.backgroundColor).toBeTruthy();
    expect(Array.from(row.children).some((el) => (el as HTMLElement).style.width === "3px")).toBe(false);
    const label = screen.getByText("Button");
    expect(label.style.fontWeight).toBe("600");
    expect(paint(label.style.color)).toBe(paint(tokens["primary-text"]!));
    expect(paint(screen.getByText("Switch").style.color)).toBe(paint(tokens["muted-foreground"]));
  });

  it("draws no markers unless the sidebar opts in", () => {
    dark(<Sidebar defaultActive="Button" items={[{ label: "Button" }, { label: "Switch", marked: true }]} />);
    expect(markerOf("Button")).toBeNull();
    expect(markerOf("Switch")).toBeNull();
  });

  it("marks the active row with the accent dot and a marked row with the hairline dot under `markers`", () => {
    dark(<Sidebar markers defaultActive="Button" items={[{ label: "Button" }, { label: "Switch", marked: true }, { label: "Radio" }]} />);
    expect(paint(markerOf("Button")!.style.backgroundColor)).toBe(paint(tokens.primary));
    expect(paint(markerOf("Switch")!.style.backgroundColor)).toBe(paint(tokens["field-border"]!));
    expect(markerOf("Radio")).toBeNull();
  });

  it("lifts a current section: accent-text eyebrow and count, foreground rows, hairline markers", () => {
    dark(<Sidebar compact markers sections={[{ title: "Controls", count: 2, current: true, items: [{ label: "Button" }, { label: "Switch" }] }]} />);
    expect(paint(screen.getByText("Controls").style.color)).toBe(paint(tokens["primary-text"]!));
    expect(paint(screen.getByText("2").style.color)).toBe(paint(tokens["primary-text"]!));
    expect(screen.getByText("Controls").style.textTransform).toBe("uppercase");
    expect(paint(screen.getByText("Button").style.color)).toBe(paint(tokens.foreground));
    expect(markerOf("Button")).toBeTruthy();
    expect(markerOf("Switch")).toBeTruthy();
  });

  it("sets a resting section's eyebrow in the subtle ink", () => {
    dark(<Sidebar sections={[{ title: "Library", items: [{ label: "Overview" }] }]} />);
    expect(paint(screen.getByText("Library").style.color)).toBe(paint(tokens["subtle-foreground"]!));
  });

  it("hosts a filter field and a heading row in the header slot, embedded as plain blocks", () => {
    dark(
      <Sidebar
        embedded
        compact
        header={
          <Column tight>
            <Input small leadingIcon icon="search" placeholder="Filter 11 components" accessibilityLabel="Filter components" />
            <Typography eyebrow>Controls</Typography>
          </Column>
        }
        items={[{ label: "Button" }]}
      />,
    );
    const field = screen.getByLabelText("Filter components");
    expect(field).toBeTruthy();
    const nav = screen.getByRole("navigation");
    // The header block sits first in the rail column, stretched to it, before the groups.
    const slot = nav.firstElementChild as HTMLElement;
    expect(slot.contains(field)).toBe(true);
    expect(slot.style.alignSelf).toBe("stretch");
    expect(slot.style.height).toBe("");
  });

  it("lets a framed sidebar's header grow past its floor for taller content", () => {
    dark(<Sidebar header={<Text>Brand</Text>} items={[{ label: "Button" }]} />);
    const header = screen.getByText("Brand").parentElement as HTMLElement;
    expect(header.style.minHeight).toBe("56px");
    expect(header.style.height).toBe("");
  });
});

// A page holding two navigation landmarks (the app's top navigation beside a sidebar, two
// sidebars) needs a distinct name on each (axe's landmark-unique), so the sidebar names its
// landmark with `accessibilityLabel`, in every frame and in solid and glass alike, and an
// unnamed sidebar stays exactly as it was.
describe("Sidebar landmark name", () => {
  const items = [{ id: "one", label: "One" }];
  for (const surface of ["solid", "glass"] as const) {
    for (const [frame, extra] of [
      ["flush", {}],
      ["bordered", { bordered: true }],
      ["embedded", { embedded: true }],
      ["shell", { header: <Text>Brand</Text> }],
    ] as const) {
      it(`names the ${frame} navigation landmark (${surface})`, () => {
        render(
          <ThemeProvider solid={surface === "solid"} glass={surface === "glass"}>
            <Sidebar {...extra} items={items} accessibilityLabel="Workspace" />
          </ThemeProvider>,
        );
        const nav = screen.getByRole("navigation", { name: "Workspace" });
        expect(nav.getAttribute("aria-label")).toBe("Workspace");
      });
    }
  }

  it("tells two sidebars on one page apart", () => {
    ui(
      <>
        <Sidebar embedded items={items} accessibilityLabel="Controls components" />
        <Sidebar embedded items={items} accessibilityLabel="Example workspace" />
      </>,
    );
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
    expect(screen.getByRole("navigation", { name: "Controls components" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Example workspace" })).toBeTruthy();
  });

  it("leaves an unnamed sidebar's landmark without a name", () => {
    ui(<Sidebar items={items} />);
    expect(screen.getByRole("navigation").hasAttribute("aria-label")).toBe(false);
  });

  it("names the responsive drawer with the same label", () => {
    resizeViewport(375);
    try {
      ui(<Sidebar responsive open items={items} accessibilityLabel="Workspace" />);
      expect(screen.getByRole("dialog", { name: "Workspace" })).toBeTruthy();
    } finally {
      resizeViewport(1280);
    }
  });
});
