import { afterEach, describe, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Stats, type StatItem } from "../src/molecules/stats/stats.tsx";

// Stats lays its metrics out as the v4 hand-off's grid does (cv-kit-code3.js `stats`):
// `repeat(auto-fit, minmax(min(100%, F), 1fr))`, F 180 px for three or more metrics and
// 220 px for one or two. Measured on the row itself, every tile takes the same cell width,
// so a narrow card stacks the metrics the hand-off stacks.

afterEach(cleanup);

// happy-dom has no ResizeObserver, so RNW never fires onLayout on its own: deliver the
// row's measured width through the handler RNW attaches to it.
type LayoutHost = HTMLElement & { __reactLayoutHandler?: (event: unknown) => void };
function layOut(node: HTMLElement, width: number) {
  const handler = (node as LayoutHost).__reactLayoutHandler;
  if (!handler) throw new Error("The row has no onLayout handler");
  act(() => handler({ nativeEvent: { layout: { x: 0, y: 0, width, height: 120 } }, timeStamp: 1 }));
}

const three: StatItem[] = [{ label: "Revenue", value: "$48.2k" }, { label: "Orders", value: "842" }, { label: "Conversion", value: "3.6%" }];
const two: StatItem[] = three.slice(0, 2);

function tileWidths(items: StatItem[], width: number, framed = false) {
  render(<ThemeProvider dark solid><Stats framed={framed} testID="stats" items={items} /></ThemeProvider>);
  const root = screen.getByTestId("stats");
  // The row is the root's last child (a title, when given, sits before it).
  const row = root.lastElementChild as HTMLElement;
  layOut(row, width);
  return [...row.children].map((tile) => (tile as HTMLElement).style.width);
}

describe("Stats grid", () => {
  for (const framed of [true, false]) {
    const gap = framed ? 12 : 0;
    const surface = framed ? "framed" : "grouped";
    it(`stacks three ${surface} metrics in a 337px card, as the hand-off's 180px floor does`, () => {
      expect(tileWidths(three, 337, framed)).toEqual(["337px", "337px", "337px"]);
    });
    it(`sets three ${surface} metrics side by side once three 180px columns fit`, () => {
      const cell = Math.floor(((600 - 0.5 - 2 * gap) / 3) * 100) / 100;
      expect(tileWidths(three, 600, framed)).toEqual([`${cell}px`, `${cell}px`, `${cell}px`]);
    });
    it(`keeps a wrapped ${surface} metric in its column instead of stretching it`, () => {
      const cell = Math.floor(((400 - 0.5 - gap) / 2) * 100) / 100;
      expect(tileWidths(three, 400, framed)).toEqual([`${cell}px`, `${cell}px`, `${cell}px`]);
    });
    it(`gives one or two ${surface} metrics the 220px floor`, () => {
      expect(tileWidths(two, 400, framed)).toEqual(["400px", "400px"]);
      cleanup();
      const cell = Math.floor(((460 - 0.5 - gap) / 2) * 100) / 100;
      expect(tileWidths(two, 460, framed)).toEqual([`${cell}px`, `${cell}px`]);
    });
  }
});

// A title sits 10px above the tiles (the skin's title line), so a titled group draws its
// one bordered box under the title instead of around it.
describe("Stats title", () => {
  it("stands above a group's box, not inside it", () => {
    render(<ThemeProvider dark solid><Stats title="This quarter" testID="stats" items={three} /></ThemeProvider>);
    const root = screen.getByTestId("stats");
    const title = screen.getByText("This quarter") as HTMLElement;
    expect(title.parentElement).toBe(root);
    expect(root.style.borderWidth).toBe("");
    const box = root.lastElementChild as HTMLElement;
    expect(box.style.borderWidth).toBe("1px");
    expect(box.contains(title)).toBe(false);
  });

  it("leads the row of framed tiles", () => {
    render(<ThemeProvider dark solid><Stats framed title="This quarter" testID="stats" items={three} /></ThemeProvider>);
    const root = screen.getByTestId("stats");
    expect(root.firstElementChild).toBe(screen.getByText("This quarter"));
  });
});
