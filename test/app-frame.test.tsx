import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsByScheme } from "../src/style/tokens.ts";
import { OverlayProvider, Portal } from "../src/style/portal.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { AppFrame, Page } from "../src/organisms/app-frame/app-frame.tsx";
import { pageMeasureOf, PAGE_MEASURE } from "../src/organisms/app-frame/app-frame.shared.tsx";

// AppFrame and Page: the app scaffolding (src/organisms/app-frame). The safe-area peer is
// absent here, so the guarded wrapper renders Views; the edges the frame asks for are read
// off the React tree (as test/qrcode.test.tsx reads QRCode's renderer), and everything
// else off the DOM react-native-web renders.

afterEach(cleanup);

const ui = (node: ReactNode, dark = false) => render(<ThemeProvider dark={dark} light={!dark}>{node}</ThemeProvider>);

// react-native-web prints colours as rgb()/rgba(); compare the channels.
function rgb(color: string): string {
  const hex = /^#([\da-f]{6})$/i.exec(color);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16)).join(",");
  return (color.match(/[\d.]+/g) ?? []).slice(0, 3).join(",");
}

type Fiber = { memoizedProps: Record<string, unknown> | null; return: Fiber | null };
/** The `edges` the components above `node` were handed, nearest first, read from React's fibers. */
function edgesAbove(node: HTMLElement): unknown[] {
  const key = Object.keys(node).find((k) => k.startsWith("__reactFiber$"));
  if (!key) throw new Error("no React fiber on the node");
  const found: unknown[] = [];
  for (let fiber: Fiber | null = (node as unknown as Record<string, Fiber>)[key]; fiber; fiber = fiber.return) {
    if (fiber.memoizedProps && "edges" in fiber.memoizedProps) found.push(fiber.memoizedProps.edges);
  }
  return found;
}

describe("AppFrame", () => {
  it("pads all four safe-area edges over the theme background, in light and dark", () => {
    for (const dark of [false, true]) {
      ui(<AppFrame testID="frame"><Typography>Body</Typography></AppFrame>, dark);
      expect(edgesAbove(screen.getByTestId("frame"))).toEqual([["top", "right", "bottom", "left"]]);
      const background = colorsByScheme[dark ? "dark" : "light"].background;
      expect(rgb(screen.getByTestId("frame").style.backgroundColor)).toBe(rgb(background));
      cleanup();
    }
  });

  it("renders the header inside a banner region above the body, and no banner without one", () => {
    ui(<AppFrame testID="frame" header={<Typography>Brand</Typography>}><Typography>Body</Typography></AppFrame>);
    const banner = screen.getByRole("banner");
    expect(banner.textContent).toBe("Brand");
    expect(banner.contains(screen.getByText("Body"))).toBe(false);
    expect(banner.compareDocumentPosition(screen.getByText("Body")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("frame").contains(banner)).toBe(true);
    cleanup();
    ui(<AppFrame><Typography>Body</Typography></AppFrame>);
    expect(screen.queryByRole("banner")).toBeNull();
  });

  it("is the app-root overlay host: a portal renders in its outlet, outside the padded frame", () => {
    ui(<AppFrame testID="frame"><Portal><Typography>Floating</Typography></Portal></AppFrame>);
    const floating = screen.getByText("Floating");
    expect(screen.getByTestId("frame").contains(floating)).toBe(false);
    // The outlet is the frame's sibling inside the host that fills the window.
    expect(screen.getByTestId("frame").parentElement!.contains(floating)).toBe(true);
  });
});

describe("Page", () => {
  it("is the main region, a scroller that keeps taps on its controls while the keyboard is up", () => {
    ui(<Page testID="page"><Typography>Content</Typography></Page>);
    const main = screen.getByRole("main");
    expect(main).toBe(screen.getByTestId("page"));
    expect(main.contains(screen.getByText("Content"))).toBe(true);
  });

  it("caps its content at widest by default, and a step or fluid overrides it", () => {
    expect(PAGE_MEASURE).toBe("widest");
    expect(pageMeasureOf({})).toBe("widest");
    expect(pageMeasureOf({ md: true })).toBe("md");
    // Narrowest wins, as on Container.
    expect(pageMeasureOf({ page: true, sm: true })).toBe("sm");
    expect(pageMeasureOf({ fluid: true, md: true })).toBe("fluid");

    const capOf = (node: ReactNode) => {
      ui(node);
      const box = screen.getByText("Content").closest("[data-testid=page] > div > div") as HTMLElement;
      const cap = box.style.maxWidth;
      const align = box.style.alignSelf;
      cleanup();
      return [cap, align];
    };
    expect(capOf(<Page testID="page"><Typography>Content</Typography></Page>)).toEqual(["1152px", "center"]);
    expect(capOf(<Page testID="page" md><Typography>Content</Typography></Page>)).toEqual(["448px", "center"]);
    expect(capOf(<Page testID="page" md start><Typography>Content</Typography></Page>)).toEqual(["448px", "flex-start"]);
    expect(capOf(<Page testID="page" fluid><Typography>Content</Typography></Page>)).toEqual(["", "center"]);
  });

  it("hosts its own overlays by default, framed by the page", () => {
    ui(<OverlayProvider><Page><Portal><Typography>Menu</Typography></Portal></Page></OverlayProvider>);
    expect(screen.getByRole("main").contains(screen.getByText("Menu"))).toBe(true);
  });

  it("with inheritOverlays is a plain box, so its overlays go to the enclosing host", () => {
    ui(<OverlayProvider viewport><Page inheritOverlays><Portal><Typography>Modal</Typography></Portal></Page></OverlayProvider>);
    expect(screen.getByRole("main").contains(screen.getByText("Modal"))).toBe(false);
    expect(screen.getByText("Modal")).toBeTruthy();
  });
});
