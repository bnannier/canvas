import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { lightColors } from "../src/style/tokens.ts";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { resetDevWarnings } from "../src/style/dev-warn.ts";
import { Swatch } from "../src/atoms/swatch/swatch.tsx";
import { paletteOf, paletteDiscColor } from "../src/atoms/swatch/swatch.shared.tsx";
import { oklchHex } from "../src/style/color.ts";
import { colorsFor } from "../src/style/tokens.ts";

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
      <Swatch color="#4f39f6" value="--primary" detail="oklch(0.511 0.262 276.966)">
        primary
      </Swatch>,
    );
    expect(rootOf(container)).toBeTruthy();
    // react-native-web normalizes the fill to rgba(…) with a two-decimal alpha.
    expect(blockOf(container).style.backgroundColor).toBe("rgba(79, 57, 246, 1.00)");
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
    const { container } = ui(<Swatch color="#4f39f6" />);
    expect(rootOf(container).children.length).toBe(1);
  });
});

describe("Swatch accessible name", () => {
  it("folds the name and value into the name (role=img hides the rendered lines)", () => {
    const { container } = ui(<Swatch color="#4f39f6" value="--primary">primary</Swatch>);
    expect(rootOf(container).getAttribute("aria-label")).toBe("primary, --primary");
  });

  it("carries the detail line too, so no line a sighted user reads is silent", () => {
    const { container } = ui(
      <Swatch color="#4f39f6" value="--primary" detail="oklch(0.511 0.262 276.966)">
        primary
      </Swatch>,
    );
    expect(rootOf(container).getAttribute("aria-label")).toBe("primary, --primary, oklch(0.511 0.262 276.966)");
  });

  it("falls back to the color string, so a bare sample is never an unnamed image", () => {
    const { container } = ui(<Swatch color="#4f39f6" />);
    expect(rootOf(container).getAttribute("aria-label")).toBe("#4f39f6");
  });

  it("uses the explicit accessibilityLabel when provided", () => {
    const { container } = ui(
      <Swatch color="#4f39f6" value="--primary" accessibilityLabel="Brand primary">
        primary
      </Swatch>,
    );
    expect(rootOf(container).getAttribute("aria-label")).toBe("Brand primary");
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
      <Swatch color="#4f39f6" value="--primary">
        <Text>primary</Text>
      </Swatch>,
    );
    expect(sawWarning("<Swatch />")).toBe(true);
    expect(sawWarning("pass `accessibilityLabel`")).toBe(true);
  });

  it("stays quiet for a text name, and for a node name that carries accessibilityLabel", () => {
    ui(<Swatch color="#4f39f6" value="--primary">primary</Swatch>);
    ui(
      <Swatch color="#4f39f6" value="--primary" accessibilityLabel="Brand primary">
        <Text>primary</Text>
      </Swatch>,
    );
    expect(warnSpy.mock.calls.filter((c) => String(c[0]).includes("[canvas]")).length).toBe(0);
  });
});

describe("Swatch boolean axes", () => {
  it("small / default / large set the block edge", () => {
    const sizes = [
      { props: { small: true }, edge: "32px" },
      { props: {}, edge: "48px" },
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
    expect(blockOf(container).style.height).toBe("32px");
  });

  it("tiny is the token chip's 20 px disc and wins over small", () => {
    const { container } = ui(<Swatch color="#4f46e5" tiny small circle />);
    expect(blockOf(container).style.height).toBe("20px");
    expect(blockOf(container).style.width).toBe("20px");
    expect(blockOf(container).style.borderTopLeftRadius).toBe("9999px");
  });

  it("ring draws a 1 px inset ring in the field border in place of the hairline edge", () => {
    const { container } = ui(<Swatch ring color="#4f46e5" />);
    const s = blockOf(container).style;
    expect(s.boxShadow).toBe(`inset 0 0 0 1px ${lightColors["field-border"]}`);
    expect(s.borderTopWidth).toBe("0px");
    const plain = ui(<Swatch color="#4f46e5" />);
    expect(blockOf(plain.container).style.borderTopWidth).not.toBe("0px");
    expect(blockOf(plain.container).style.boxShadow).toBe("");
  });

  it("the root hugs through the layout context, never a static flex-start, so a chip's centred row centres the disc", () => {
    // Outside a stretching Column the root declares no alignSelf: the parent's cross-axis
    // alignment (a Chip's centre, a Row's) decides where the sample sits.
    const { container } = ui(<Swatch tiny ring circle color="#4f46e5" />);
    expect(rootOf(container).style.alignSelf).toBe("");
  });

  it("a selected ringed sample keeps the selection ring outside the inset ring", () => {
    const { container } = ui(<Swatch ring selected color="#4f46e5" />);
    expect(blockOf(container).style.boxShadow).toBe(
      `inset 0 0 0 1px ${lightColors["field-border"]}, 0 0 0 2px ${lightColors.background}, 0 0 0 4px ${lightColors.primary}`,
    );
  });

  it("circle rounds the block fully", () => {
    const { container } = ui(<Swatch circle color="#4f39f6" />);
    expect(blockOf(container).style.borderTopLeftRadius).toBe("9999px");
  });

  it("inline puts the label column beside the block", () => {
    const { container } = ui(<Swatch inline color="#4f39f6" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.flexDirection).toBe("row");
  });

  it("stacks the label column under the block by default", () => {
    const { container } = ui(<Swatch color="#4f39f6" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.flexDirection).toBe("column");
  });

  it("block stretches the sample and keeps the size as its height", () => {
    const { container } = ui(<Swatch block color="#4f39f6" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.height).toBe("48px");
    expect(blockOf(container).style.width).toBe("");
  });

  it("circle keeps its 1:1 footprint under block (a stretched circle is not a circle)", () => {
    const { container } = ui(<Swatch block circle color="#4f39f6" />);
    expect(rootOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.width).toBe("48px");
  });

  it("inline keeps the block's width under block (a stretched row child has none)", () => {
    // `inline` makes the root a ROW, where a stretched child stretches vertically and
    // has no width of its own, which collapsed the sample to a sliver. The root still
    // widens so the label column gets the space.
    const { container } = ui(<Swatch inline block color="#4f39f6" value="--primary">primary</Swatch>);
    expect(rootOf(container).style.alignSelf).toBe("stretch");
    expect(blockOf(container).style.width).toBe("48px");
    expect(blockOf(container).style.alignSelf).not.toBe("stretch");
  });
});

describe("Swatch look (the hand-off renderer)", () => {
  // The hand-off's swatch lines sit on the faces' own 16 and 14 px lines (Foundations color.06).
  it("sets the name 500 13/16 and the value lines 400 11/14 mono in the subtle ink, flush", () => {
    const { getByText } = ui(<Swatch color="#4f39f6" value="--primary" detail="oklch">primary</Swatch>);
    const name = (getByText("primary") as HTMLElement).style;
    expect([name.fontSize, name.lineHeight, name.fontWeight]).toEqual(["13px", "16px", "500"]);
    for (const t of ["--primary", "oklch"]) {
      const st = (getByText(t) as HTMLElement).style;
      expect([st.fontSize, st.lineHeight, st.fontWeight]).toEqual(["11px", "14px", "400"]);
      expect(st.fontFamily).toContain("monospace");
    }
  });

  it("puts the label 8 px under the chip and 10 px beside it inline", () => {
    const a = ui(<Swatch color="#4f39f6">primary</Swatch>);
    expect(rootOf(a.container).style.gap).toBe("8px");
    a.unmount();
    const b = ui(<Swatch inline color="#4f39f6">primary</Swatch>);
    expect(rootOf(b.container).style.gap).toBe("10px");
  });

  it("rounds the chip at the 12 px tile corner at every size", () => {
    for (const p of [{ small: true }, {}, { large: true }]) {
      const { container, unmount } = ui(<Swatch color="#4f39f6" {...p} />);
      expect(blockOf(container).style.borderTopLeftRadius).toBe("12px");
      unmount();
    }
  });

  it("rings a selected sample in the page color then the accent, and says so", () => {
    const { container } = ui(<Swatch selected color="#4f39f6" value="--primary">primary</Swatch>);
    expect(blockOf(container).style.boxShadow).toBe(`0 0 0 2px ${lightColors.background}, 0 0 0 4px ${lightColors.primary}`);
    expect(rootOf(container).getAttribute("aria-label")).toBe("primary, --primary, selected");
    const plain = ui(<Swatch color="#4f39f6" testID="p" />);
    expect(blockOf(plain.container).style.boxShadow).toBe("");
  });
});

describe("Swatch palette picker", () => {
  // The hand-off docs navbar's hue swatch: a 16 px disc of oklch(.72 .17 hue), a radio
  // named for its palette, ringed only when it is the palette in force.
  const radios = (c: HTMLElement) => Array.from(c.querySelectorAll('[role="radio"]')) as HTMLElement[];
  const discOf = (radio: HTMLElement) => radio.firstElementChild as HTMLElement;

  it("resolves the palette with ThemeProvider's precedence, and null without one", () => {
    expect(paletteOf({})).toBeNull();
    expect(paletteOf({ violet: true })).toBe("violet");
    expect(paletteOf({ violet: true, amber: true })).toBe("amber");
    expect(paletteOf({ amber: true, rose: true })).toBe("rose");
    expect(paletteOf({ rose: true, mint: true })).toBe("mint");
    expect(paletteOf({ mint: true, cyan: true })).toBe("cyan");
  });

  it("is a radio named for its palette, checked when selected", () => {
    const { container } = ui(
      <>
        <Swatch violet selected onPress={() => {}} />
        <Swatch cyan onPress={() => {}} />
      </>,
    );
    const [violet, cyan] = radios(container);
    expect(violet.getAttribute("aria-label")).toBe("Violet");
    expect(violet.getAttribute("aria-checked")).toBe("true");
    expect(cyan.getAttribute("aria-label")).toBe("Cyan");
    expect(cyan.getAttribute("aria-checked")).toBe("false");
  });

  it("fills a 16 px disc with the palette's hue, the same in both schemes", () => {
    for (const scheme of [{ dark: true }, { light: true }]) {
      const { container, unmount } = render(<ThemeProvider {...scheme}><Swatch rose onPress={() => {}} /></ThemeProvider>);
      const disc = discOf(radios(container)[0]);
      expect(disc.style.width).toBe("16px");
      expect(disc.style.height).toBe("16px");
      const hex = paletteDiscColor("rose");
      const n = parseInt(hex.slice(1), 16);
      expect(disc.style.backgroundColor).toBe(`rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 1.00)`);
      unmount();
    }
    expect(paletteDiscColor("violet")).toBe(oklchHex(0.72, 0.17, 285));
  });

  it("rings only the palette in force: a card gap, then a muted-foreground band", () => {
    const { container } = render(
      <ThemeProvider light>
        <Swatch mint selected onPress={() => {}} />
        <Swatch amber onPress={() => {}} />
      </ThemeProvider>,
    );
    const [mint, amber] = radios(container).map(discOf);
    const t = colorsFor("violet", "light");
    expect(mint.style.boxShadow).toBe(`0 0 0 2px ${t.card}, 0 0 0 4px ${t["muted-foreground"]}`);
    expect(amber.style.boxShadow).toBe("");
  });

  it("picks on press", () => {
    let picked = 0;
    const { container } = ui(<Swatch amber onPress={() => { picked += 1; }} />);
    fireEvent.click(radios(container)[0]);
    expect(picked).toBe(1);
  });

  it("grows the disc under a mouse on the web, never under touch", () => {
    const { container } = ui(<Swatch cyan onPress={() => {}} />);
    const radio = radios(container)[0];
    expect(discOf(radio).style.transform).toBe("");
    fireEvent.pointerEnter(radio, { pointerType: "touch" });
    expect(discOf(radio).style.transform).toBe("");
    fireEvent.pointerEnter(radio, { pointerType: "mouse" });
    expect(discOf(radio).style.transform).toBe("scale(1.25)");
    fireEvent.pointerLeave(radio, { pointerType: "mouse" });
    expect(discOf(radio).style.transform).toBe("");
  });
});
