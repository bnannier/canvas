// Phase-6 structural narrow modes. happy-dom never fires onLayout, so every
// container-measured collapse here is exercised through its viewport seed via
// test/viewport.ts (fresh render per width).
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { FilterPanel } from "../src/organisms/filter-panel/filter-panel.tsx";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const rootOf = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

describe("Navbar narrow collapse", () => {
  const LINKS = ["Overview", "Deploys", "Alerts"];

  it("renders inline links at desktop widths (no menu button)", () => {
    ui(<Navbar brand="Canvas" links={LINKS} />);
    expect(screen.getByText("Deploys")).toBeTruthy();
    expect(screen.queryByLabelText("Navigation menu")).toBeNull();
  });

  it("swaps the links row for a menu button at phone widths; selecting fires onSelect", () => {
    resizeViewport(375);
    let picked = -1;
    ui(<Navbar brand="Canvas" links={LINKS} onSelect={(i) => { picked = i; }} />);
    // Links live behind the closed menu now.
    expect(screen.queryByText("Deploys")).toBeNull();
    const trigger = screen.getByLabelText("Navigation menu");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText("Deploys"));
    expect(picked).toBe(1);
  });
});

describe("Steps stacks", () => {
  const STEPS = [{ label: "Account" }, { label: "Profile" }, { label: "Done" }];

  it("keeps the horizontal row at desktop widths", () => {
    ui(<Steps stacks steps={STEPS} testID="steps" />);
    expect(rootOf("steps").style.flexDirection).toBe("row");
  });

  it("renders the existing vertical layout at phone widths", () => {
    resizeViewport(375);
    ui(<Steps stacks steps={STEPS} testID="steps" />);
    expect(rootOf("steps").style.flexDirection).not.toBe("row");
    expect(screen.getByText("Profile")).toBeTruthy();
  });

  it("does nothing without stacks", () => {
    resizeViewport(375);
    ui(<Steps steps={STEPS} testID="steps" />);
    expect(rootOf("steps").style.flexDirection).toBe("row");
  });
});

describe("Tabs responsive vertical", () => {
  const TABS = ["General", "Security", "Billing"];

  // happy-dom has no ResizeObserver, so RNW's onLayout never fires on its own; fire the
  // handler RNW attaches to the host node (the progress.test.tsx idiom). The responsive
  // measurement rides an out-of-flow probe SIBLING that spans the container (the rail
  // hugs ~180px, so self-measure would latch `narrow` true in any container). The probe
  // renders before the tablist root, so it is the first layout-handling div in document
  // order in both states.
  type LayoutHost = { __reactLayoutHandler?: (e: unknown) => void };
  const probe = () => {
    for (const el of Array.from(document.querySelectorAll("div"))) {
      const h = (el as unknown as LayoutHost).__reactLayoutHandler;
      if (typeof h === "function") {
        return {
          el,
          fire: (width: number) =>
            act(() => h({ nativeEvent: { layout: { x: 0, y: 0, width, height: 0, left: 0, top: 0 } }, timeStamp: 1 })),
        };
      }
    }
    throw new Error("no layout-handling container probe in the tree");
  };
  // Settle useReducedMotion's async AccessibilityInfo read within act (the
  // progress.test.tsx idiom): the probe-driving tests take extra event-loop
  // turns, so without this the read's state update lands outside act.
  const settle = () => act(async () => {});

  it("keeps the vertical rail at desktop widths", () => {
    ui(<Tabs vertical responsive tabs={TABS} testID="tabs" />);
    expect(rootOf("tabs").style.flexDirection).toBe("column");
  });

  it("measures the CONTAINER through the probe, never the hugging rail", async () => {
    ui(<Tabs vertical responsive tabs={TABS} testID="tabs" />);
    await settle();
    const rail = rootOf("tabs");
    // The regression: the rail itself must carry no measurement (its ~180px
    // self-measure is what used to flatten it inside any container).
    expect((rail as unknown as LayoutHost).__reactLayoutHandler).toBeUndefined();
    const p = probe();
    expect(rail.contains(p.el)).toBe(false);
    // A real wide-container measurement keeps the rail.
    p.fire(1400);
    expect(rootOf("tabs").style.flexDirection).toBe("column");
  });

  it("flattens when the probe reports a narrow container and restores when it widens", async () => {
    ui(<Tabs vertical responsive tabs={TABS} testID="tabs" />);
    await settle();
    probe().fire(500);
    expect(rootOf("tabs").style.flexDirection).toBe("row");
    // The probe stays mounted in the flattened state and still reports the
    // CONTAINER (not the scroller's min(content, container)), so widening
    // un-flattens instead of latching.
    probe().fire(900);
    expect(rootOf("tabs").style.flexDirection).toBe("column");
  });

  it("renders the horizontal underline look at phone widths", () => {
    resizeViewport(375);
    ui(<Tabs vertical responsive tabs={TABS} testID="tabs" />);
    expect(rootOf("tabs").style.flexDirection).toBe("row");
    expect(screen.getByText("Security")).toBeTruthy();
  });

  it("does nothing without responsive", () => {
    resizeViewport(375);
    ui(<Tabs vertical tabs={TABS} testID="tabs" />);
    expect(rootOf("tabs").style.flexDirection).toBe("column");
  });
});

describe("FilterPanel responsive drawer", () => {
  const GROUPS = [
    { title: "Status", options: [{ label: "Active" }, { label: "Pending" }] },
  ];

  it("renders the docked panel at desktop widths", () => {
    ui(<FilterPanel responsive groups={GROUPS} testID="fp" />);
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.queryByText("Filters (0)")).toBeNull();
  });

  it("collapses to the Filters trigger at phone widths and opens the drawer", () => {
    resizeViewport(375);
    ui(<FilterPanel responsive groups={GROUPS} testID="fp" />);
    // Docked panel content is behind the closed drawer.
    expect(screen.queryByText("Status")).toBeNull();
    fireEvent.click(screen.getByText("Filters"));
    expect(screen.getByText("Status")).toBeTruthy();
  });

  it("shows the live active count on the trigger", () => {
    resizeViewport(375);
    ui(
      <FilterPanel
        responsive
        groups={[{ title: "Status", options: [{ label: "Active", checked: true }] }]}
      />,
    );
    expect(screen.getByText("Filters (1)")).toBeTruthy();
  });
});
