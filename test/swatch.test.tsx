import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { Swatch } from "../src/atoms/swatch/swatch.tsx";

// Swatch is display-only, so there is no interaction to drive: what has to hold is the
// anatomy (the block plus the label column it OWNS), the data-carrying accessible name
// (role="img" hides the rendered lines from assistive tech), and that each boolean on
// the size / shape / layout axes actually changes the block.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const rootOf = (c: HTMLElement) => c.querySelector('[role="img"]') as HTMLElement;
const blockOf = (c: HTMLElement) => rootOf(c).firstElementChild as HTMLElement;

describe("Swatch anatomy", () => {
  it("renders the block and owns the name, value, and detail lines", () => {
    const { container, getByText } = ui(
      <Swatch color="#4f46e5" value="--primary" detail="oklch(0.511 0.262 276.966)">
        primary
      </Swatch>,
    );
    expect(rootOf(container)).toBeTruthy();
    // react-native-web normalizes the fill to rgba(…) with a two-decimal alpha.
    expect(blockOf(container).style.backgroundColor).toBe("rgba(79, 70, 229, 1.00)");
    expect(getByText("primary")).toBeTruthy();
    expect(getByText("--primary")).toBeTruthy();
    expect(getByText("oklch(0.511 0.262 276.966)")).toBeTruthy();
  });

  it("draws the hairline edge, so a sample the color of the surface still has a shape", () => {
    const { container } = ui(<Swatch color="#ffffff" value="--background">background</Swatch>);
    expect(blockOf(container).style.borderTopWidth).not.toBe("");
    expect(blockOf(container).style.borderTopColor).not.toBe("");
  });

  it("renders the block alone when there is no name, value, or detail", () => {
    const { container } = ui(<Swatch color="#4f46e5" />);
    expect(rootOf(container).children.length).toBe(1);
  });
});

describe("Swatch accessible name", () => {
  it("folds the name and value into the name (role=img hides the rendered lines)", () => {
    const { container } = ui(<Swatch color="#4f46e5" value="--primary">primary</Swatch>);
    expect(rootOf(container).getAttribute("aria-label")).toBe("primary, --primary");
  });

  it("carries the detail line too, so no line a sighted user reads is silent", () => {
    const { container } = ui(
      <Swatch color="#4f46e5" value="--primary" detail="oklch(0.511 0.262 276.966)">
        primary
      </Swatch>,
    );
    expect(rootOf(container).getAttribute("aria-label")).toBe("primary, --primary, oklch(0.511 0.262 276.966)");
  });

  it("falls back to the color string, so a bare sample is never an unnamed image", () => {
    const { container } = ui(<Swatch color="#4f46e5" />);
    expect(rootOf(container).getAttribute("aria-label")).toBe("#4f46e5");
  });

  it("uses the explicit accessibilityLabel when provided", () => {
    const { container } = ui(
      <Swatch color="#4f46e5" value="--primary" accessibilityLabel="Brand indigo">
        primary
      </Swatch>,
    );
    expect(rootOf(container).getAttribute("aria-label")).toBe("Brand indigo");
  });
});

describe("Swatch dev warning", () => {
  let warnSpy: ReturnType<typeof spyOn>;
  beforeEach(() => {
    // The once-per-message cache is process-wide, so another file rendering the same
    // misuse first would swallow this assertion. Clear it before each.
    resetDevWarnings();
    warnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
    cleanup();
  });

  const sawWarning = (substr: string) => warnSpy.mock.calls.some((c) => String(c[0]).includes(substr));

  it("warns when the name is a node and no accessibilityLabel is given", () => {
    ui(
      <Swatch color="#4f46e5" value="--primary">
        <Text>primary</Text>
      </Swatch>,
    );
    expect(sawWarning("<Swatch />")).toBe(true);
    expect(sawWarning("pass `accessibilityLabel`")).toBe(true);
  });

  it("stays quiet for a text name, and for a node name that carries accessibilityLabel", () => {
    ui(<Swatch color="#4f46e5" value="--primary">primary</Swatch>);
    ui(
      <Swatch color="#4f46e5" value="--primary" accessibilityLabel="Brand indigo">
        <Text>primary</Text>
      </Swatch>,
    );
    expect(warnSpy.mock.calls.filter((c) => String(c[0]).includes("[canvas]")).length).toBe(0);
  });
});

describe("Swatch boolean axes", () => {
  it("small / default / large set the block edge", () => {
    const sizes = [
      { props: { small: true }, edge: "40px" },
      { props: {}, edge: "56px" },
      { props: { large: true }, edge: "72px" },
    ];
    for (const s of sizes) {
      const { container, unmount } = ui(<Swatch color="#4f46e5" {...s.props} />);
      expect(blockOf(container).style.height).toBe(s.edge);
      expect(blockOf(container).style.width).toBe(s.edge);
      unmount();
    }
  });

  it("size precedence is first-match: small wins over large", () => {
    const { container } = ui(<Swatch color="#4f46e5" small large />);
    expect(blockOf(container).style.height).toBe("40px");
  });

  it("circle rounds the block fully", () => {
    const { container } = ui(<Swatch circle color="#4f46e5" />);
    expect(blockOf(container).style.borderTopLeftRadius).toBe("9999px");
  });

  it("inline puts the label column beside the block", () => {
    const { container } = ui(<Swatch inline color="#4f46e5" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.flexDirection).toBe("row");
  });

  it("stacks the label column under the block by default", () => {
    const { container } = ui(<Swatch color="#4f46e5" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.flexDirection).toBe("column");
  });

  it("block stretches the sample and keeps the size as its height", () => {
    const { container } = ui(<Swatch block color="#4f46e5" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.height).toBe("56px");
    expect(blockOf(container).style.width).toBe("");
  });

  it("circle keeps its 1:1 footprint under block (a stretched circle is not a circle)", () => {
    const { container } = ui(<Swatch block circle color="#4f46e5" />);
    expect(rootOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.width).toBe("56px");
  });
});
