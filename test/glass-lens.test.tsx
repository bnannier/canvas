import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import {
  GLASS_LENS_ID,
  GLASS_LENS_FILTER,
  hasGlassLens,
  ensureGlassLens,
  lensBackdropSupported,
} from "../src/style/glass-surface/glass-lens.ts";

// The web Liquid Glass lens tier: an SVG displacement filter injected once per
// document and applied as the material layer's backdrop-filter on Chromium web.
// The pure gate is exercised directly; the component-level tests flip the real
// environment (happy-dom's UA carries no "Chrome/" token, so the lens stays off
// unless a test overrides the user agent).

afterEach(cleanup);

// Restore by deleting the own property: the real getter lives on the prototype.
function overrideUserAgent(value: string) {
  Object.defineProperty(window.navigator, "userAgent", { value, configurable: true });
  return () => {
    delete (window.navigator as unknown as Record<string, unknown>)["userAgent"];
  };
}

const CHROME_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const HEADLESS_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/126.0.0.0 Safari/537.36";
const SAFARI_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const FIREFOX_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:130.0) Gecko/20100101 Firefox/130.0";
const IOS_CHROME_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1";

describe("lensBackdropSupported (pure engine gate)", () => {
  const yes = () => true;
  it("allows the Chromium family, headless included", () => {
    expect(lensBackdropSupported(CHROME_UA, yes)).toBe(true);
    expect(lensBackdropSupported(HEADLESS_UA, yes)).toBe(true);
  });
  it("denies WebKit and Gecko, which parse the value but render no filter", () => {
    expect(lensBackdropSupported(SAFARI_UA, yes)).toBe(false);
    expect(lensBackdropSupported(FIREFOX_UA, yes)).toBe(false);
    // iOS Chrome is WebKit underneath and identifies as CriOS, not Chrome.
    expect(lensBackdropSupported(IOS_CHROME_UA, yes)).toBe(false);
  });
  it("denies an engine whose CSS.supports rejects the value outright", () => {
    expect(lensBackdropSupported(CHROME_UA, () => false)).toBe(false);
  });
});

describe("ensureGlassLens (document-level injector)", () => {
  it("injects the filter once, idempotently, under the id the CSS token points at", () => {
    // The module's import-time injection has already run in this document.
    expect(hasGlassLens()).toBe(true);
    expect(ensureGlassLens()).toBe(true);
    expect(ensureGlassLens()).toBe(true);
    expect(document.querySelectorAll(`#${GLASS_LENS_ID}`).length).toBe(1);
    const filter = document.getElementById(GLASS_LENS_ID)!;
    // The lens anatomy: two rim-concentrated displacement passes, then the
    // blur + saturation the frost tier otherwise supplies.
    expect(filter.querySelectorAll("feDisplacementMap").length).toBe(2);
    expect(filter.querySelectorAll("feImage").length).toBe(2);
    expect(filter.querySelectorAll("feGaussianBlur").length).toBe(1);
    expect(filter.querySelectorAll("feColorMatrix").length).toBe(1);
  });
});

describe("GlassSurface lens tier", () => {
  it("upgrades the material to the lens backdrop-filter on a Chromium UA", async () => {
    const restore = overrideUserAgent(CHROME_UA);
    try {
      render(
        <ThemeProvider surface="glass">
          <GlassSurface testID="lens-gs" style={{ borderRadius: 12 }}>
            <Text>content</Text>
          </GlassSurface>
        </ThemeProvider>,
      );
      await waitFor(() => {
        const outer = screen.getByTestId("lens-gs") as HTMLElement;
        const clip = outer.firstElementChild as HTMLElement;
        // Material order inside the clip box: under-fill, lens layer, specular
        // rim, then the content.
        const lensLayer = clip.children[1] as HTMLElement;
        expect(lensLayer.getAttribute("style") ?? "").toContain(GLASS_LENS_ID);
        // react-native-web must pass the non-ViewStyle property through to CSS.
        expect(lensLayer.style.backdropFilter).toBe(GLASS_LENS_FILTER);
        // The rim rides above the lens; the frost's BlurView is replaced, not
        // stacked (exactly one backdrop-filtered layer).
        const rim = clip.children[2] as HTMLElement;
        expect(rim.getAttribute("style") ?? "").toContain("box-shadow");
        const filtered = Array.from(clip.children).filter((c) => ((c as HTMLElement).getAttribute("style") ?? "").includes("backdrop-filter"));
        expect(filtered.length).toBe(1);
      });
    } finally {
      restore();
    }
  });

  it("stays off the lens on a non-Chromium UA (happy-dom's own), keeping the ladder's next rung", async () => {
    render(
      <ThemeProvider surface="glass">
        <GlassSurface testID="frost-gs" style={{ borderRadius: 12 }}>
          <Text>content</Text>
        </GlassSurface>
      </ThemeProvider>,
    );
    await waitFor(() => {
      const outer = screen.getByTestId("frost-gs") as HTMLElement;
      // expo-blur is stubbed in the test setup, so the next rung down here is
      // the PlainSurface fallback: a single box, no material layers.
      expect(outer.getAttribute("style") ?? "").not.toContain("backdrop-filter");
      expect(outer.querySelector("[style*='backdrop-filter']")).toBeNull();
    });
  });

  it("keeps the Reduce Transparency rung above the lens (opaque, no filter)", async () => {
    const restore = overrideUserAgent(CHROME_UA);
    const spy = spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-reduced-transparency"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList,
    );
    try {
      render(
        <ThemeProvider surface="glass">
          <GlassSurface testID="rt-gs" style={{ borderRadius: 12 }}>
            <Text>content</Text>
          </GlassSurface>
        </ThemeProvider>,
      );
      await waitFor(() => {
        const outer = screen.getByTestId("rt-gs") as HTMLElement;
        expect(outer.querySelector("[style*='backdrop-filter']")).toBeNull();
        expect((outer.getAttribute("style") ?? "")).not.toContain("backdrop-filter");
      });
    } finally {
      spy.mockRestore();
      restore();
    }
  });
});
