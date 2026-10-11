// The container-measurement primitives (src/style/container.ts). happy-dom
// never fires RNW onLayout, so these tests drive the returned handler directly
// with synthetic layout events: the established seam for measured behavior.
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { LayoutChangeEvent } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { useContainerBreakpoint, useContainerWidth } from "../src/style/container.ts";
import { BreakpointOverride, seedWidth } from "../src/style/responsive.tsx";
import { breakpoints, type BreakpointKey } from "../src/style/tokens.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

const layoutEvent = (width: number) => ({ nativeEvent: { layout: { width } } }) as LayoutChangeEvent;

let fire: ((e: LayoutChangeEvent) => void) | null = null;
let renders = 0;

function Probe({ seed }: { seed?: boolean }) {
  renders += 1;
  const { value, width, measured, onLayout } = useContainerBreakpoint(
    { base: "desktop", md: "mid", sm: "phone" },
    { seedViewport: seed },
  );
  fire = onLayout;
  return <div data-testid="probe">{`${value}:${width}:${measured}`}</div>;
}

const ui = (seed?: boolean) =>
  render(
    <ThemeProvider>
      <Probe seed={seed} />
    </ThemeProvider>,
  );

describe("useContainerBreakpoint", () => {
  it("renders base (desktop-first) until measured, then resolves its OWN width", () => {
    ui();
    expect(screen.getByTestId("probe").textContent).toBe("desktop:0:false");
    act(() => fire!(layoutEvent(375.4)));
    expect(screen.getByTestId("probe").textContent).toBe("phone:375:true");
    act(() => fire!(layoutEvent(700)));
    expect(screen.getByTestId("probe").textContent).toBe("mid:700:true");
    act(() => fire!(layoutEvent(900)));
    expect(screen.getByTestId("probe").textContent).toBe("desktop:900:true");
  });

  it("ignores subpixel relayout churn (same rounded width never cascades re-renders)", () => {
    ui();
    act(() => fire!(layoutEvent(375.4)));
    const after = renders;
    // All of these round to 375. React may re-render ONCE before bailing out of
    // a same-value set; the contract is that churn never cascades beyond that.
    act(() => fire!(layoutEvent(375.2)));
    act(() => fire!(layoutEvent(374.8)));
    act(() => fire!(layoutEvent(375.3)));
    act(() => fire!(layoutEvent(374.6)));
    expect(renders).toBeLessThanOrEqual(after + 1);
    expect(screen.getByTestId("probe").textContent).toBe("phone:375:true");
  });

  it("seedViewport resolves against the window width before the first layout", () => {
    resizeViewport(375);
    ui(true);
    // Unmeasured, but seeded from the 375 window: the phone arrangement, not base.
    expect(screen.getByTestId("probe").textContent).toBe("phone:0:false");
    act(() => fire!(layoutEvent(800)));
    // A real measurement wins over the seed.
    expect(screen.getByTestId("probe").textContent).toBe("desktop:800:true");
  });
});

// The pre-measurement seed follows the viewport BUCKET, so a BreakpointOverride (the
// docs playground's simulated phone, a test pinning a tier) moves it into the
// simulated tier; without an override nothing changes. Before the bucket fed it, the
// seed read the real window and a simulated phone in a 1280 window painted its first
// frame wide ("desktop" and 1280 below).
let fireWidth: ((e: LayoutChangeEvent) => void) | null = null;

function WidthProbe() {
  const { width, measured, onLayout } = useContainerWidth();
  fireWidth = onLayout;
  return <div data-testid="width">{`${width}:${measured}`}</div>;
}

const underOverride = (bucket: BreakpointKey | "base" | null, seed = true) =>
  render(
    <ThemeProvider>
      <BreakpointOverride value={bucket}>
        <Probe seed={seed} />
        <WidthProbe />
      </BreakpointOverride>
    </ThemeProvider>,
  );

describe("the pre-measurement seed under a BreakpointOverride", () => {
  it("seeds the simulated phone tier inside the 1280 desktop window", () => {
    underOverride("sm");
    expect(screen.getByTestId("probe").textContent).toBe("phone:0:false");
    // The window width clamped into sm: the widest width the phone tier has.
    expect(screen.getByTestId("width").textContent).toBe(`${breakpoints.sm}:false`);
  });

  it("seeds the tablet tier from a phone window, and base above 2xl", () => {
    resizeViewport(375);
    cleanup();
    underOverride("md");
    expect(screen.getByTestId("probe").textContent).toBe("mid:0:false");
    expect(screen.getByTestId("width").textContent).toBe(`${breakpoints.sm + 1}:false`);
    cleanup();
    underOverride("base");
    expect(screen.getByTestId("probe").textContent).toBe("desktop:0:false");
    expect(screen.getByTestId("width").textContent).toBe(`${breakpoints["2xl"] + 1}:false`);
  });

  it("leaves an unseeded reading at base: only `seedViewport` opts into the seed", () => {
    underOverride("sm", false);
    expect(screen.getByTestId("probe").textContent).toBe("desktop:0:false");
  });

  it("gives way to the measured width once it lands", () => {
    underOverride("sm");
    act(() => fire!(layoutEvent(900)));
    act(() => fireWidth!(layoutEvent(900)));
    expect(screen.getByTestId("probe").textContent).toBe("desktop:900:true");
    expect(screen.getByTestId("width").textContent).toBe("900:true");
  });

  it("is the window itself when no override is set (null clears one)", () => {
    underOverride(null);
    expect(screen.getByTestId("probe").textContent).toBe("desktop:0:false");
    expect(screen.getByTestId("width").textContent).toBe("1280:false");
    cleanup();
    resizeViewport(700);
    underOverride(null);
    expect(screen.getByTestId("probe").textContent).toBe("mid:0:false");
    expect(screen.getByTestId("width").textContent).toBe("700:false");
  });

  it("stays out of the server render, override or ssrBreakpoint alike: no window there", () => {
    const html = renderToString(
      <ThemeProvider ssrBreakpoint="sm">
        <BreakpointOverride value="sm">
          <Probe seed />
          <WidthProbe />
        </BreakpointOverride>
      </ThemeProvider>,
    );
    expect(html).toContain('data-testid="probe">desktop:0:false<');
    expect(html).toContain('data-testid="width">0:false<');
  });
});

// The breakpoint each width sits in, read straight off the token scale: the oracle
// seedWidth is checked against.
const ORDER: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl"];
const bucketAt = (width: number): BreakpointKey | "base" =>
  width <= 0 ? "base" : (ORDER.find((bp) => width <= breakpoints[bp]) ?? "base");

describe("seedWidth", () => {
  it("returns the window unchanged when it already sits in the bucket, and a width of the bucket otherwise", () => {
    for (let window = 0; window <= 1700; window += 1) {
      expect(seedWidth(bucketAt(window), window)).toBe(window);
      for (const bucket of [...ORDER, "base"] as const) {
        const seeded = seedWidth(bucket, window);
        expect(bucketAt(seeded)).toBe(bucket);
      }
    }
  });

  it("clamps to the nearest edge of the bucket", () => {
    expect(seedWidth("sm", 1280)).toBe(breakpoints.sm);
    expect(seedWidth("lg", 375)).toBe(breakpoints.md + 1);
    expect(seedWidth("lg", 1600)).toBe(breakpoints.lg);
    expect(seedWidth("base", 375)).toBe(breakpoints["2xl"] + 1);
  });
});
