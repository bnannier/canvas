import { describe, it, expect, afterEach, beforeEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Row, Column } from "../src/atoms/layout/layout.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { resizeViewport } from "./viewport.ts";

// Row children's `weight`: a share of the Row's free width (CSS grid's `minmax(0, Nfr)`),
// the split the Canvas v4 anatomy section draws at 1.7 to 1, which twelfths cannot name.

afterEach(cleanup);
beforeEach(resetDevWarnings);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);
const at = (testID: string) => document.querySelector(`[data-testid="${testID}"]`) as HTMLElement;

function warnings(run: () => void): string[] {
  const seen: string[] = [];
  const original = console.warn;
  console.warn = (m: string) => { seen.push(m); };
  try { run(); } finally { console.warn = original; }
  return seen;
}

describe("Row weights", () => {
  it("gives each weighted child its share of the free width, with no content basis or floor", () => {
    ui(
      <Row testID="r">
        <Column weight={1.7} testID="figure"><Badge>a</Badge></Column>
        <Column weight={1} testID="legend"><Badge>b</Badge></Column>
      </Row>,
    );
    for (const [id, grow] of [["figure", "1.7"], ["legend", "1"]] as const) {
      const style = at(id).style;
      expect(style.flexGrow).toBe(grow);
      expect(style.flexShrink).toBe("1");
      expect(style.flexBasis).toMatch(/^0(px|%)?$/);
      expect(style.minWidth).toMatch(/^0(px)?$/);
    }
    // No span cell: the weighted children sit straight in the Row.
    expect(at("figure").parentElement).toBe(at("r"));
  });

  it("replaces fill on the same box", () => {
    const seen = warnings(() => ui(<Row><Column weight={2} fill testID="w"><Badge>a</Badge></Column></Row>));
    expect(at("w").style.flexGrow).toBe("2");
    expect(seen.some((m) => m.includes("replaces `fill`"))).toBe(true);
  });

  it("is inert once a stacks Row has stacked, and in a Column", () => {
    resizeViewport(400);
    ui(
      <Row stacks testID="r">
        <Column weight={1.7} testID="a"><Badge>a</Badge></Column>
        <Column weight={1} testID="b"><Badge>b</Badge></Column>
      </Row>,
    );
    expect(at("r").style.flexDirection).toBe("column");
    expect(at("a").style.flexGrow).toBe("");
    expect(at("a").style.flexBasis).toBe("");
    const seen = warnings(() => ui(<Column><Column weight={1} testID="c"><Badge>c</Badge></Column></Column>));
    expect(at("c").style.flexGrow).toBe("");
    expect(seen.some((m) => m.includes("shares out a Row's width"))).toBe(true);
  });

  it("ignores a weight that is not a positive number, with a warning", () => {
    const seen = warnings(() => ui(<Row><Column weight={0} testID="z"><Badge>a</Badge></Column></Row>));
    expect(at("z").style.flexGrow).toBe("");
    expect(seen.some((m) => m.includes("positive, finite number"))).toBe(true);
  });
});
