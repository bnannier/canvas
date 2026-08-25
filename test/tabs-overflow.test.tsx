// Horizontal overflow for Tabs: a non-block underline/pills row rides inside a
// horizontal ScrollView so a row longer than its container pans instead of
// clipping; block and vertical render unwrapped as before. happy-dom fires no
// layout or scroll events, so the DOM assertions here are structural (wrapper
// present/absent) and the scroll-into-view positioning is covered as the pure
// tabScrollTarget function (the board-logic/chart-math precedent).
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { tabScrollTarget } from "../src/organisms/tabs/tabs.shared.tsx";

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const rootOf = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

// The scroller frame is the ancestor carrying the overflowScroller style (the
// RNW overflow itself resolves to hashed classes, so the inline flexGrow:0 +
// maxWidth:100% pair is the stable inline signature).
const scrollerOf = (el: HTMLElement | null): HTMLElement | null => {
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    if (node.style.maxWidth === "100%" && node.style.flexGrow === "0") return node;
  }
  return null;
};

const MANY = ["General", "Security", "Notifications", "Billing", "Integrations", "Advanced"];

describe("Tabs horizontal overflow scroller", () => {
  it("wraps the underline row in the scroller frame", () => {
    ui(<Tabs tabs={MANY} testID="tabs" />);
    const row = rootOf("tabs");
    expect(row.getAttribute("role")).toBe("tablist");
    expect(scrollerOf(row)).not.toBeNull();
  });

  it("wraps the pills row in the scroller frame", () => {
    ui(<Tabs pills tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).not.toBeNull();
  });

  it("leaves a block row unwrapped (equal shares cannot overflow)", () => {
    ui(<Tabs block tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).toBeNull();
  });

  it("leaves the vertical rail unwrapped", () => {
    ui(<Tabs vertical tabs={MANY} testID="tabs" />);
    expect(scrollerOf(rootOf("tabs"))).toBeNull();
  });

  it("keeps selection and the single aria-selected working through the scroller", () => {
    let picked = -1;
    ui(<Tabs tabs={MANY} testID="tabs" onSelect={(i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Billing"));
    expect(picked).toBe(3);
    expect(rootOf("tabs").querySelectorAll('[aria-selected="true"]').length).toBe(1);
  });
});

// Geometry: a 600-wide row in a 300-wide viewport, 24px peek padding.
describe("tabScrollTarget", () => {
  it("returns null when the row fits the viewport", () => {
    expect(tabScrollTarget({ x: 500, width: 100 }, 600, 600, 0)).toBeNull();
    expect(tabScrollTarget({ x: 0, width: 100 }, 600, 400, 0)).toBeNull();
  });

  it("returns null before layout (zero viewport)", () => {
    expect(tabScrollTarget({ x: 500, width: 100 }, 0, 0, 0)).toBeNull();
  });

  it("scrolls a trigger past the trailing edge into view with peek padding", () => {
    expect(tabScrollTarget({ x: 400, width: 100 }, 300, 600, 0)).toBe(224);
  });

  it("scrolls a trigger past the leading edge into view with peek padding", () => {
    expect(tabScrollTarget({ x: 100, width: 100 }, 300, 600, 300)).toBe(76);
  });

  it("clamps to the scrollable range at both ends", () => {
    expect(tabScrollTarget({ x: 0, width: 100 }, 300, 600, 300)).toBe(0);
    expect(tabScrollTarget({ x: 520, width: 80 }, 300, 600, 0)).toBe(300);
  });

  it("returns null when the trigger is already fully visible", () => {
    expect(tabScrollTarget({ x: 330, width: 100 }, 300, 600, 300)).toBeNull();
  });
});
