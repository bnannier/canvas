import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, screen, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { radius } from "../src/style/tokens.ts";
import { Image } from "../src/atoms/image/image.tsx";
import { declaresPointSize, tileCount } from "../src/atoms/image/image.shared.tsx";
import { imageLabel, namedImageRole } from "../src/atoms/image/image.accessibility.ts";
import { Avatar } from "../src/atoms/avatar/avatar.tsx";
import { CardMedia } from "../src/molecules/card/card.tsx";
import { MediaObject } from "../src/molecules/media-objects/media-objects.tsx";

// Image is display-only, so what has to hold is the fit axis (each boolean reaches the
// rendered fill, first match wins), the box it is given, and the name: react-native-web
// names an image only from aria-label / accessibilityLabel and drops `alt`, so the shell
// resolves the label itself and hands it to react-native-web, whose hidden <img alt> is
// then the one image node with that name; an unnamed image stays decorative (no role, no
// name, an empty alt on the hidden <img>). The image role is native's alone: on the web
// it would sit on the root above that <img> and name a second image.
//
// react-native-web draws the picture as a background layer (the root's first child) and
// keeps a transparent <img> beside it for the context menu and the alt text; it mounts
// that <img> once the load starts, which the render's effects do.

afterEach(cleanup);
const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);
const SRC = { uri: "https://example.com/portrait.jpg" };

const rootOf = (c: HTMLElement) => c.querySelector('[data-testid="i"]') as HTMLElement;
const fillOf = (c: HTMLElement) => rootOf(c).firstElementChild as HTMLElement;
const altOf = (c: HTMLElement) => rootOf(c).querySelector("img")?.getAttribute("alt");

describe("Image fit axis", () => {
  const sizeOf = (n: ReactNode) => getComputedStyle(fillOf(ui(n).container)).backgroundSize;

  it("covers by default, and each fit boolean reaches the rendered fill", () => {
    expect(sizeOf(<Image source={SRC} testID="i" />)).toBe("cover");
    cleanup();
    expect(sizeOf(<Image source={SRC} cover testID="i" />)).toBe("cover");
    cleanup();
    expect(sizeOf(<Image source={SRC} contain testID="i" />)).toBe("contain");
    cleanup();
    expect(sizeOf(<Image source={SRC} stretch testID="i" />)).toBe("100% 100%");
    cleanup();
    expect(sizeOf(<Image source={SRC} center testID="i" />)).toBe("auto");
    cleanup();
    expect(sizeOf(<Image source={SRC} none testID="i" />)).toBe("auto");
    cleanup();
    const { container } = ui(<Image source={SRC} repeat testID="i" />);
    expect(getComputedStyle(fillOf(container)).backgroundSize).toBe("auto");
    expect(getComputedStyle(fillOf(container)).backgroundRepeat).toBe("repeat");
  });

  it("resolves two fits by first match: contain > cover > stretch > center > repeat > none", () => {
    expect(sizeOf(<Image source={SRC} cover contain testID="i" />)).toBe("contain");
    cleanup();
    expect(sizeOf(<Image source={SRC} stretch cover testID="i" />)).toBe("cover");
    cleanup();
    expect(sizeOf(<Image source={SRC} center stretch testID="i" />)).toBe("100% 100%");
    cleanup();
    expect(sizeOf(<Image source={SRC} repeat center testID="i" />)).toBe("auto");
    cleanup();
    const { container } = ui(<Image source={SRC} none repeat testID="i" />);
    expect(getComputedStyle(fillOf(container)).backgroundRepeat).toBe("repeat");
  });
});

describe("Image box", () => {
  it("takes its size from width and height and its corners from the radius scale", () => {
    const { container } = ui(<Image source={SRC} width={120} height={80} radius="full" testID="i" />);
    const root = rootOf(container);
    expect(root.style.width).toBe("120px");
    expect(root.style.height).toBe("80px");
    expect(root.style.borderTopLeftRadius).toBe(`${radius.full}px`);
  });

  it("takes a percent width, and composes `style` with the box", () => {
    const { container } = ui(<Image source={SRC} width="100%" height={96} style={{ aspectRatio: 2 }} testID="i" />);
    const root = rootOf(container);
    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("96px");
    // react-native-web writes a numeric ratio as CSS's `<w> / <h>`.
    expect(root.style.aspectRatio).toBe("2 / 1");
  });

  it("leaves the corners square without a radius", () => {
    const { container } = ui(<Image source={SRC} width={40} height={40} testID="i" />);
    expect(rootOf(container).style.borderTopLeftRadius).toBe("");
  });
});

describe("Image name", () => {
  it("names one image from `alt`: the hidden <img>, under a root that takes no role", () => {
    const { container } = ui(<Image source={SRC} alt="Portrait of Kira Tanaka" testID="i" />);
    const root = rootOf(container);
    const named = screen.getAllByRole("img", { name: "Portrait of Kira Tanaka" });
    expect(named).toHaveLength(1);
    expect(named[0]).toBe(root.querySelector("img")!);
    expect(root.getAttribute("role")).toBeNull();
    expect(altOf(container)).toBe("Portrait of Kira Tanaka");
  });

  it("names it the same way from `accessibilityLabel`", () => {
    const { container } = ui(<Image source={SRC} accessibilityLabel="Portrait of Kira Tanaka" testID="i" />);
    expect(screen.getAllByRole("img", { name: "Portrait of Kira Tanaka" })).toHaveLength(1);
    expect(rootOf(container).getAttribute("role")).toBeNull();
    expect(altOf(container)).toBe("Portrait of Kira Tanaka");
  });

  it("lets accessibilityLabel win over alt, and aria-label over both (React Native's order)", () => {
    const both = ui(<Image source={SRC} alt="Alt text" accessibilityLabel="Label" testID="i" />).container;
    expect(altOf(both)).toBe("Label");
    cleanup();
    const all = ui(<Image source={SRC} alt="Alt text" accessibilityLabel="Label" aria-label="Aria" testID="i" />).container;
    expect(altOf(all)).toBe("Aria");
    // The resolver Image and CardMedia share, empty strings naming nothing.
    expect(imageLabel({ alt: "Alt text", accessibilityLabel: "Label" })).toBe("Label");
    expect(imageLabel({ alt: "Alt text", accessibilityLabel: "" })).toBe("Alt text");
    expect(imageLabel({ alt: "" })).toBeUndefined();
  });

  it("keeps a caller's own role on a named image", () => {
    const { container } = ui(<Image source={SRC} alt="Chart preview" role="figure" testID="i" />);
    expect(rootOf(container).getAttribute("role")).toBe("figure");
  });

  it("takes no role on the web runtime and the image role on native", () => {
    expect(namedImageRole()).toBeUndefined();
    for (const platform of ["ios", "android"] as const) {
      // react-native-web's Platform.select always picks web: exercise the native branch
      // without changing the platform other test files see (the calendar's pattern).
      const select = spyOn(Platform, "select").mockImplementation((specifics) => specifics[platform] ?? specifics.native ?? specifics.default);
      try {
        expect(namedImageRole(), platform).toBe("img");
      } finally {
        select.mockRestore();
      }
    }
  });
});

// The kit's own pictures go through Image, so each one is a single image node too: an
// Avatar photo, a CardMedia cover and a MediaObject's photo.
describe("Image inside the kit", () => {
  it("names each kit photo once", () => {
    ui(
      <>
        <Avatar src="https://example.com/ada.jpg" name="Ada Lovelace" />
        <CardMedia src="https://example.com/cover.jpg" alt="Workspace cover" />
        <MediaObject src="https://example.com/rc.jpg" title="Rachel Chen" />
      </>,
    );
    for (const name of ["Ada Lovelace", "Workspace cover", "Rachel Chen"]) {
      expect(screen.getAllByRole("img", { name }), name).toHaveLength(1);
    }
  });
});

describe("Image decorative", () => {
  it("has no role and no name without one, and an empty alt on the hidden <img>", () => {
    const { container } = ui(<Image source={SRC} testID="i" />);
    const root = rootOf(container);
    expect(root.getAttribute("role")).toBeNull();
    expect(root.getAttribute("aria-label")).toBeNull();
    expect(altOf(container)).toBe("");
  });

  it("reads an empty alt as decorative, exactly like no alt", () => {
    const { container } = ui(<Image source={SRC} alt="" testID="i" />);
    expect(rootOf(container).getAttribute("role")).toBeNull();
    expect(altOf(container)).toBe("");
  });
});

// `repeat` over a source that states its point size (a bundled asset, or `{ uri, width,
// height }`) is tiled by the kit: one measuring tile first, then a grid of plain stretched
// images at the tile's point size, clipped by the box, so every platform tiles at the
// asset's point size and draws the density variant it picked 1:1. happy-dom lays nothing
// out, so the test fires the layout handlers react-native-web attaches, as a browser would.
describe("Image repeat tiling", () => {
  const TILE = { uri: "https://example.com/grain.png", width: 180, height: 180 };
  type LayoutHost = { __reactLayoutHandler?: (event: unknown) => void };
  const layout = (node: Element, width: number, height: number) =>
    act(() => (node as unknown as LayoutHost).__reactLayoutHandler?.({ nativeEvent: { layout: { x: 0, y: 0, width, height } }, timeStamp: 1 }));
  const gridOf = (c: HTMLElement) => rootOf(c).firstElementChild as HTMLElement;
  const tilesOf = (c: HTMLElement) => [...gridOf(c).children].flatMap((row) => [...row.children]) as HTMLElement[];

  it("mounts one measuring tile, then covers the measured box with point-size tiles", () => {
    const { container } = ui(<Image source={TILE} repeat width="100%" height={200} testID="i" />);
    expect(tilesOf(container)).toHaveLength(1);
    layout(rootOf(container), 400, 200);
    layout(tilesOf(container)[0], 180, 180);
    // 400 / 180 rounds up to 3 columns, 200 / 180 to 2 rows.
    expect(gridOf(container).children).toHaveLength(2);
    expect(tilesOf(container)).toHaveLength(6);
    for (const tile of tilesOf(container)) {
      expect(getComputedStyle(tile.firstElementChild as HTMLElement).backgroundSize).toBe("100% 100%");
      expect(getComputedStyle(tile.firstElementChild as HTMLElement).backgroundRepeat).toBe("no-repeat");
    }
    const clip = getComputedStyle(rootOf(container));
    expect([clip.overflow, clip.overflowX]).toContain("hidden");
    expect(gridOf(container).style.position).toBe("absolute");
  });

  it("keeps the measuring tile when the box grows, and follows a new box size", () => {
    const { container } = ui(<Image source={TILE} repeat width="100%" height={200} testID="i" />);
    const first = tilesOf(container)[0];
    layout(rootOf(container), 400, 200);
    layout(first, 180, 180);
    expect(tilesOf(container)[0]).toBe(first);
    layout(rootOf(container), 900, 400);
    expect(tilesOf(container)).toHaveLength(5 * 3);
  });

  it("hides the tiles from assistive tech and names a named repeat image once, on its box", () => {
    const { container } = ui(<Image source={TILE} repeat alt="Paper texture" width={360} height={180} testID="i" />);
    layout(rootOf(container), 360, 180);
    layout(tilesOf(container)[0], 180, 180);
    const named = screen.getAllByRole("img", { name: "Paper texture" });
    expect(named).toHaveLength(1);
    expect(named[0]).toBe(rootOf(container));
    expect(gridOf(container).getAttribute("aria-hidden")).toBe("true");
    for (const img of container.querySelectorAll("img")) expect(img.getAttribute("alt")).toBe("");
  });

  it("stays decorative without a name", () => {
    const { container } = ui(<Image source={TILE} repeat width={360} height={180} testID="i" />);
    expect(rootOf(container).getAttribute("role")).toBeNull();
    expect(rootOf(container).getAttribute("aria-label")).toBeNull();
  });

  it("leaves a source with no point size to React Native's own repeat, and every other fit untouched", () => {
    const { container } = ui(<Image source={SRC} repeat testID="i" />);
    expect(getComputedStyle(fillOf(container)).backgroundRepeat).toBe("repeat");
    cleanup();
    const sized = ui(<Image source={TILE} cover testID="i" />).container;
    expect(getComputedStyle(fillOf(sized)).backgroundSize).toBe("cover");
  });

  it("counts tiles by rounding up, and knows which sources state a point size", () => {
    expect(tileCount(400, 180)).toBe(3);
    expect(tileCount(360, 180)).toBe(2);
    expect(tileCount(0, 180)).toBe(1);
    expect(tileCount(400, 0)).toBe(1);
    expect(declaresPointSize(7)).toBe(true);
    expect(declaresPointSize(TILE)).toBe(true);
    expect(declaresPointSize(SRC)).toBe(false);
    expect(declaresPointSize([TILE])).toBe(false);
    expect(declaresPointSize({ uri: "x", width: 0, height: 10 })).toBe(false);
    expect(declaresPointSize(undefined)).toBe(false);
  });
});
