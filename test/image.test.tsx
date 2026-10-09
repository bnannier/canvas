import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { radius } from "../src/style/tokens.ts";
import { Image } from "../src/atoms/image/image.tsx";

// Image is display-only, so what has to hold is the fit axis (each boolean reaches the
// rendered fill, first match wins), the box it is given, and the name: react-native-web
// names an image only from aria-label / accessibilityLabel and drops `alt`, so the shell
// resolves the label itself and a named image is a role="img" with it, while an unnamed
// one stays decorative (no role, no name, an empty alt on the hidden <img>).
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
  it("names a role=img from `alt`, and the alt text reaches the hidden <img>", () => {
    const { container } = ui(<Image source={SRC} alt="Portrait of Kira Tanaka" testID="i" />);
    const root = rootOf(container);
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toBe("Portrait of Kira Tanaka");
    expect(altOf(container)).toBe("Portrait of Kira Tanaka");
  });

  it("names it the same way from `accessibilityLabel`", () => {
    const { container } = ui(<Image source={SRC} accessibilityLabel="Portrait of Kira Tanaka" testID="i" />);
    const root = rootOf(container);
    expect(root.getAttribute("role")).toBe("img");
    expect(root.getAttribute("aria-label")).toBe("Portrait of Kira Tanaka");
    expect(altOf(container)).toBe("Portrait of Kira Tanaka");
  });

  it("lets accessibilityLabel win over alt, and aria-label over both (React Native's order)", () => {
    const both = ui(<Image source={SRC} alt="Alt text" accessibilityLabel="Label" testID="i" />).container;
    expect(rootOf(both).getAttribute("aria-label")).toBe("Label");
    expect(altOf(both)).toBe("Label");
    cleanup();
    const all = ui(<Image source={SRC} alt="Alt text" accessibilityLabel="Label" aria-label="Aria" testID="i" />).container;
    expect(rootOf(all).getAttribute("aria-label")).toBe("Aria");
  });

  it("keeps a caller's own role on a named image", () => {
    const { container } = ui(<Image source={SRC} alt="Chart preview" role="figure" testID="i" />);
    expect(rootOf(container).getAttribute("role")).toBe("figure");
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
