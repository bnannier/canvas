import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { type ComponentType, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import { channelsOf } from "../src/style/color.ts";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";
import { DescriptionList, type DescriptionListProps } from "../src/molecules/description-lists/description-lists.tsx";
import { DescriptionList as IosDescriptionList } from "../src/molecules/description-lists/description-lists.ios.tsx";
import { DescriptionList as AndroidDescriptionList } from "../src/molecules/description-lists/description-lists.android.tsx";
import { rowsOf } from "../src/molecules/description-lists/description-lists.shared.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/molecules/description-lists/description-lists.styles.ts";

// The rows axis: `ruled` is the v4 hand-off's accessibility-card row (Component.dc.html
// line 258: `grid-template-columns:minmax(120px,auto) 1fr;gap:14px;align-items:center;
// padding:9px 0;border-top:1px solid var(--ln)`), a 1 px top rule on every row including
// the first, where `divided` rules under every row but the last.

afterEach(cleanup);
const dark = colorsFor("violet", "dark");
const ui = (node: ReactNode) => render(<ThemeProvider dark solid>{node}</ThemeProvider>);
const rowOf = (text: string) => screen.getByText(text).parentElement!.parentElement!;

const ENTRIES = [["web", DescriptionList, webSkin], ["ios", IosDescriptionList, iosSkin], ["android", AndroidDescriptionList, androidSkin]] as Array<[string, ComponentType<DescriptionListProps>, typeof webSkin]>;

describe("DescriptionList rows axis", () => {
  it("resolves ruled over divided, and neither to the plain row", () => {
    expect(rowsOf({})).toBeNull();
    expect(rowsOf({ divided: true })).toBe("divided");
    expect(rowsOf({ ruled: true })).toBe("ruled");
    expect(rowsOf({ ruled: true, divided: true })).toBe("ruled");
  });

  it("the web and Android skins carry the hand-off's ruled metrics; iOS keeps its centered 52pt row", () => {
    expect(webSkin.ruled).toEqual({ rowPadY: 9, termMinWidth: 120, gap: 14 });
    expect(androidSkin.ruled).toEqual(webSkin.ruled);
    expect(iosSkin.ruled).toEqual({ rowPadY: 0, termMinWidth: 120, gap: 14 });
  });
});

for (const [platform, List, skin] of ENTRIES) {
  describe(`DescriptionList ruled (${platform})`, () => {
    it("rules the top of every row, the first included, in the border token, with the skin's padding and gap", () => {
      ui(<List twoColumn ruled items={[{ term: "Enter", value: "Activates" }, { term: "Space", value: "Also activates" }]} />);
      for (const value of ["Activates", "Also activates"]) {
        const row = rowOf(value);
        expect(row.style.borderTopWidth, value).toBe("1px");
        expect(channelsOf(row.style.borderTopColor), value).toEqual(channelsOf(dark.border));
        expect(row.style.borderBottomWidth, value).toBe("");
        expect(row.style.paddingTop, value).toBe(`${skin.ruled.rowPadY}px`);
        expect(row.style.paddingBottom, value).toBe(`${skin.ruled.rowPadY}px`);
        expect(row.style.paddingLeft, value).toBe("");
        expect(row.style.gap, value).toBe(`${skin.ruled.gap}px`);
      }
    });

    it("hugs the term over the 120 floor instead of the fixed label column, for a text and a node term", () => {
      ui(<List twoColumn ruled items={[{ term: "Roles", value: "button" }, { term: <Kbd>Tab</Kbd>, value: "Moves focus" }]} />);
      const term = screen.getByText("Roles");
      expect(term.style.minWidth).toBe("120px");
      expect(term.style.width).toBe("");
      // The node term's holder is the row's first child (the value cell follows it).
      const nodeTerm = rowOf("Moves focus").firstElementChild as HTMLElement;
      expect(nodeTerm.textContent).toBe("Tab");
      expect(nodeTerm.style.minWidth).toBe("120px");
      expect(nodeTerm.style.width).toBe("");
    });

    it("wins over divided, and leaves a divided list as it was", () => {
      ui(<List twoColumn ruled divided items={[{ term: "A", value: "first" }, { term: "B", value: "last" }]} />);
      expect(rowOf("first").style.borderTopWidth).toBe("1px");
      expect(rowOf("first").style.borderBottomWidth).toBe("");
      expect(rowOf("last").style.borderTopWidth).toBe("1px");
      cleanup();
      ui(<List twoColumn divided items={[{ term: "A", value: "first" }, { term: "B", value: "last" }]} />);
      expect(rowOf("first").style.borderTopWidth).toBe("");
      expect(rowOf("first").style.borderBottomWidth).toBe("1px");
      expect(rowOf("last").style.borderBottomWidth).toBe("");
      expect(screen.getByText("A").style.width).toBe("160px");
    });

    it("replaces the inset card's row padding rather than stacking on it", () => {
      ui(<List card twoColumn ruled items={[{ term: "A", value: "first" }]} />);
      const row = rowOf("first");
      expect(row.style.paddingTop).toBe(`${skin.ruled.rowPadY}px`);
      expect(row.style.borderTopWidth).toBe("1px");
    });
  });
}
