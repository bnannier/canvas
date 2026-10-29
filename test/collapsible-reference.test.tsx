import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors, shape } from "../src/style/tokens.ts";
import { MONO_FONT } from "../src/style/mono.ts";
import { channelsOf } from "../src/style/color.ts";
import { Collapsible } from "../src/molecules/collapsible/collapsible.tsx";
import { Collapsible as AndroidCollapsible } from "../src/molecules/collapsible/collapsible.android.tsx";
import { Collapsible as IosCollapsible } from "../src/molecules/collapsible/collapsible.ios.tsx";

// The v4 hand-off's reference-sheet disclosure, a sub-component's props card
// (Component.dc.html lines 245 to 250): `border:1px solid var(--ln);border-radius:16px;
// overflow:hidden;background:var(--sf)`, a toggle `height:46px;padding:0 16px;font:600 14px
// var(--ft)` with the count `font:400 12px var(--fm);color:var(--tx3)` inline after the
// name, and the table flush inside the card.

afterEach(cleanup);

const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},1.00)`;
};
const toggle = () => screen.getByRole("button") as HTMLElement;
const root = () => screen.getByTestId("sheet") as HTMLElement;

describe("Collapsible reference", () => {
  it("draws the card corner on the border hairline over the card fill", () => {
    render(<ThemeProvider><Collapsible testID="sheet" reference title="AvatarMenuProps" description="3 props">rows</Collapsible></ThemeProvider>);
    expect(root().style.borderRadius).toBe(`${shape.web.card}px`);
    expect(root().style.borderTopWidth).toBe("1px");
    expect(channelsOf(root().style.borderTopColor)).toEqual(channelsOf(lightColors.border));
    expect(root().style.backgroundColor.replace(/\s/g, "")).toBe(rgb(lightColors.card));
  });

  it("sets the 46 px toggle, 16 in, with the 600 14 title and the count inline in the mono meta ink", () => {
    render(<ThemeProvider><Collapsible testID="sheet" reference title="AvatarMenuProps" description="3 props">rows</Collapsible></ThemeProvider>);
    expect(toggle().style.minHeight).toBe("46px");
    expect(toggle().style.paddingLeft).toBe("16px");
    expect(toggle().style.paddingTop).toBe("0px");
    const title = screen.getByText("AvatarMenuProps");
    expect(title.style.fontSize).toBe("14px");
    expect(title.style.lineHeight).toBe("18px");
    expect(title.style.fontWeight).toBe("600");
    const count = screen.getByText("3 props");
    // One run: the count sits inside the title's text.
    expect(title.contains(count)).toBe(true);
    expect(count.style.fontFamily).toContain(MONO_FONT.split(",")[0]!.trim());
    expect(count.style.fontSize).toBe("12px");
    expect(count.style.lineHeight).toBe("16px");
    expect(count.style.color.replace(/\s/g, "")).toBe(rgb(lightColors["subtle-foreground"]!));
  });

  it("keeps the content flush to the card so an attached table's rows meet its edge", () => {
    render(<ThemeProvider><Collapsible testID="sheet" reference defaultOpen title="AvatarMenuProps" description="3 props"><span>rows</span></Collapsible></ThemeProvider>);
    const panel = screen.getByText("rows").parentElement as HTMLElement;
    expect(panel.style.paddingLeft).toBe("0px");
    expect(panel.style.paddingBottom).toBe("0px");
  });

  it("is the card look's own inset without reference", () => {
    render(<ThemeProvider><Collapsible testID="sheet" card title="Shipping" description="3 props">rows</Collapsible></ThemeProvider>);
    expect(root().style.borderRadius).toBe("14px");
    expect(toggle().style.paddingTop).toBe("14px");
    expect(toggle().style.minHeight).toBe("");
  });

  it("draws the same card on Android, the web disclosure in Roboto", () => {
    render(<ThemeProvider><AndroidCollapsible testID="sheet" reference title="AvatarMenuProps" description="3 props">rows</AndroidCollapsible></ThemeProvider>);
    expect(root().style.borderRadius).toBe(`${shape.web.card}px`);
    expect(toggle().style.minHeight).toBe("46px");
  });

  it("changes nothing on iOS, whose disclosure group is the inset-grouped card already", () => {
    render(<ThemeProvider><IosCollapsible testID="sheet" reference title="AvatarMenuProps" description="3 props">rows</IosCollapsible></ThemeProvider>);
    expect(root().style.borderRadius).toBe(`${shape.ios.card}px`);
    expect(toggle().style.minHeight).toBe("");
    // The description stays its own line under the title on iOS.
    expect(screen.getByText("AvatarMenuProps").contains(screen.getByText("3 props"))).toBe(false);
  });
});
