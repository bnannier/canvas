import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Text, tabularNums } from "../src/style/index.js";
import { Stats } from "../src/molecules/stats/stats.tsx";
import { DataTable } from "../src/organisms/data-table/data-table.tsx";

// Tabular figures, and why the kit needs a helper for two words of style.
//
// `fontVariant: ["tabular-nums"]` is React Native's API and works on iOS and Android.
// react-native-web DROPS it: no inline style, no generated class, no stylesheet rule,
// and no warning, so the element renders identically to one that never asked. Every
// tabular-figure call site in the kit was therefore a no-op in a browser. The web
// branch emits `font-variant-numeric`, the CSS property that actually does this.
//
// The harness resolves react-native to react-native-web, so these assert the WEB
// branch; the native branch is the plain RN style prop and is verified on device.

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("tabularNums", () => {
  it("emits the CSS property on web", () => {
    expect(tabularNums()).toEqual({ fontVariantNumeric: "tabular-nums" } as never);
  });

  it("actually reaches the DOM, which the React Native spelling does not", () => {
    const { container } = ui(
      <>
        <Text style={{ ...tabularNums(), fontSize: 12 }}>helper</Text>
        <Text style={{ fontVariant: ["tabular-nums"], fontSize: 12 }}>raw</Text>
      </>,
    );
    const styleOf = (text: string) =>
      Array.from(container.querySelectorAll("div")).find((el) => el.textContent === text)?.getAttribute("style") ?? "";
    expect(styleOf("helper")).toContain("font-variant-numeric: tabular-nums");
    // The regression this guards: if react-native-web ever starts honouring the
    // React Native spelling, the helper can collapse; until then this is the reason
    // it exists, stated as a fact rather than a comment.
    expect(styleOf("raw")).not.toContain("variant");
  });
});

describe("numbers that are read down a column", () => {
  it("a DataTable numeric cell uses tabular figures", () => {
    ui(<DataTable columns={["Name", { label: "Amount", numeric: true }]} rows={[["Ada", "1,204.00"]]} />);
    const cell = screen.getByText("1,204.00");
    expect(cell.getAttribute("style")).toContain("font-variant-numeric: tabular-nums");
    // The alignment that made the column worth reading down in the first place.
    expect(cell.getAttribute("style")).toContain("text-align: right");
  });

  it("a DataTable text cell does not", () => {
    ui(<DataTable columns={["Name", { label: "Amount", numeric: true }]} rows={[["Ada", "1,204.00"]]} />);
    expect(screen.getByText("Ada").getAttribute("style")).not.toContain("variant");
  });

  it("a Stats value and its delta use tabular figures", () => {
    // A headline figure that updates in place must not change width as its digits do.
    ui(<Stats items={[{ label: "Revenue", value: "$41,109", delta: "+11.4%" }]} />);
    for (const text of ["$41,109", "+11.4%"]) {
      expect(screen.getByText(text).getAttribute("style"), text).toContain("font-variant-numeric: tabular-nums");
    }
  });
});
