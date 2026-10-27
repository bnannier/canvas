import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { webShadow } from "../src/style/shadow.ts";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { Navbar as IosNavbar } from "../src/organisms/navbars/navbars.ios.tsx";
import { Navbar as AndroidNavbar } from "../src/organisms/navbars/navbars.android.tsx";
import { densityOf } from "../src/organisms/navbars/navbars.shared.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/organisms/navbars/navbars.styles.ts";
import { resizeViewport } from "./viewport.ts";

// The v4 Navbar: the hand-off's web bar (its `K.def('navbars')` renderer: 56px, a 16px
// gutter, 20px between the clusters, 32px capsule links), the `compact` density (the
// docs pill: 44px, 5px in, 2px between items), the `scrolls` narrow mode (the content
// row pans instead of folding into the menu) and `hrefs` (real anchors on the web).

afterEach(cleanup);

const ui = (node: ReactNode, light = false) => render(<ThemeProvider light={light} dark={!light} solid>{node}</ThemeProvider>);
const LINKS = ["Docs", "Components", "Templates", "Changelog"];

describe("Navbar web skin (the hand-off renderer)", () => {
  it("is 56px with a 16px gutter and 20px between clusters by default, 44/5/2 compact", () => {
    expect(webSkin.bar(darkColors, "default")).toMatchObject({ height: 56, paddingHorizontal: 16, gap: 20 });
    expect(webSkin.bar(darkColors, "compact")).toMatchObject({ height: 44, paddingHorizontal: 5, gap: 2 });
    expect(webSkin.leftGroup(darkColors, "default").gap).toBe(20);
    expect(webSkin.linksRow(darkColors, "default").gap).toBe(4);
    expect(webSkin.rightGroup(darkColors, "default").gap).toBe(10);
    for (const group of [webSkin.leftGroup, webSkin.linksRow, webSkin.rightGroup]) expect(group(darkColors, "compact").gap).toBe(2);
  });

  it("draws 32px capsule links in 500 13px, the active one on `secondary` in the foreground", () => {
    for (const t of [darkColors, lightColors]) {
      expect(webSkin.linkTile(t, false)).toMatchObject({ height: 32, paddingHorizontal: 10, borderRadius: 9999, backgroundColor: "transparent" });
      expect(webSkin.linkTile(t, true).backgroundColor).toBe(t.secondary);
      expect(webSkin.linkLabel(t, false)).toMatchObject({ fontSize: 13, fontWeight: "500", color: t["muted-foreground"] });
      expect(webSkin.linkLabel(t, true).color).toBe(t.foreground);
    }
  });

  it("floats as a pill on the 16% hairline with the md shade and the popover fill", () => {
    for (const t of [darkColors, lightColors]) {
      const floating = webSkin.surfaceContainer(t, "floating");
      expect(floating).toMatchObject({ borderRadius: 9999, borderWidth: 1, borderColor: t["field-border"], backgroundColor: t.popover });
      expect((floating as { boxShadow?: string }).boxShadow).toBe(webShadow("md", t));
      expect(webSkin.surfaceContainer(t, "bordered")).toMatchObject({ borderRadius: 14, borderColor: t["field-border"] });
      expect(webSkin.surfaceContainer(t, "default")).toMatchObject({ borderBottomWidth: 1, borderColor: t.border });
    }
    // The hand-off's ln2 is the 16% hairline in both schemes.
    expect(darkColors["field-border"]).toBe("rgba(255, 255, 255, 0.16)");
    expect(lightColors["field-border"]).toBe("rgba(17, 17, 24, 0.16)");
  });

  it("washes a hovered resting link with the active look, and never the native skins", () => {
    // The test runs as the web, so webHover declares the look.
    expect(webSkin.linkHover?.(darkColors)).toEqual({ tile: { backgroundColor: darkColors.secondary }, label: { color: darkColors.foreground } });
    expect(iosSkin.linkHover).toBeNull();
    expect(androidSkin.linkHover).toBeNull();
  });

  it("keeps the native default bars as they were and tightens them compact", () => {
    expect(iosSkin.bar(darkColors, "default")).toEqual({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 44, paddingHorizontal: 16 });
    expect(androidSkin.bar(darkColors, "default")).toEqual({ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 64, paddingHorizontal: 16 });
    expect(iosSkin.bar(darkColors, "compact")).toMatchObject({ height: 44, paddingHorizontal: 8 });
    expect(androidSkin.bar(darkColors, "compact")).toMatchObject({ height: 48, paddingHorizontal: 8 });
  });
});

describe("Navbar density", () => {
  it("resolves `compact`, else the default bar", () => {
    expect(densityOf({})).toBe("default");
    expect(densityOf({ compact: true })).toBe("compact");
  });

  it("renders the compact bar 44px tall on every platform skin's own height", () => {
    for (const [Bar, height] of [[Navbar, "44px"], [IosNavbar, "44px"], [AndroidNavbar, "48px"]] as const) {
      ui(<Bar compact testID="bar" brand="Canvas" links={LINKS} />);
      expect(screen.getByTestId("bar").style.height).toBe(height);
      cleanup();
    }
  });
});

describe("Navbar scrolls", () => {
  it("keeps every link at phone widths inside a horizontal scroller, with no menu button", () => {
    resizeViewport(375);
    let picked = -1;
    const { container } = ui(<Navbar scrolls floating compact testID="bar" brand="Canvas" links={LINKS} onSelect={(i) => { picked = i; }} />);
    for (const link of LINKS) expect(screen.getByText(link)).toBeTruthy();
    expect(screen.queryByLabelText("Navigation menu")).toBeNull();
    // The bar hands its gutter to the scroller's content row.
    const bar = screen.getByTestId("bar");
    expect(bar.style.paddingLeft === "" || bar.style.paddingLeft === "0px").toBe(true);
    const scroller = Array.from(container.querySelectorAll("div")).find((el) => getComputedStyle(el).overflowX === "auto" || el.style.overflowX === "auto");
    expect(scroller).toBeTruthy();
    expect(scroller!.contains(screen.getByText("Changelog"))).toBe(true);
    fireEvent.click(screen.getByText("Templates"));
    expect(picked).toBe(2);
  });

  it("still folds the links into the menu at phone widths without it", () => {
    resizeViewport(375);
    ui(<Navbar brand="Canvas" links={LINKS} />);
    expect(screen.queryByText("Components")).toBeNull();
    expect(screen.getByLabelText("Navigation menu")).toBeTruthy();
  });
});

describe("Navbar hrefs", () => {
  const HREFS = ["/docs", "/components", "/templates", "/changelog"];

  it("renders each link with a destination as an anchor and still selects it on a plain click", () => {
    let picked = -1;
    let event: unknown;
    const { container } = ui(<Navbar brand="Canvas" links={LINKS} hrefs={HREFS} onSelect={(i, e) => { picked = i; event = e; }} />);
    const anchors = Array.from(container.querySelectorAll("a"));
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual(HREFS);
    expect(anchors[0].getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByText("Templates"));
    expect(picked).toBe(2);
    expect(event).toBeTruthy();
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("Templates");
  });

  it("leaves a modifier click to the browser: nothing is selected or reported", () => {
    let picked = -1;
    const { container } = ui(<Navbar brand="Canvas" links={LINKS} hrefs={HREFS} onSelect={(i) => { picked = i; }} />);
    fireEvent.click(screen.getByText("Components"), { metaKey: true });
    expect(picked).toBe(-1);
    expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("Docs");
  });

  it("keeps a link without a destination a plain pressable", () => {
    const { container } = ui(<Navbar brand="Canvas" links={LINKS} hrefs={["/docs"]} />);
    expect(container.querySelectorAll("a")).toHaveLength(1);
  });
});
