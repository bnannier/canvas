// The viewport half of the responsiveness system (src/style/responsive.ts):
// the pure desktop-first picker, the shared breakpoint store behind
// useBreakpoint/useResponsive/useFormFactor, the width<=0-means-desktop rule
// (SSR and the pre-layout first frame), and the bucket-granular re-render
// contract. Narrow branches are driven through test/viewport.ts, which mutates
// the stateful visualViewport stub and re-fires RNW's resize listener: the
// exact signal a real browser resize produces.
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import {
  responsive,
  useResponsive,
  useBreakpoint,
  formFactor,
  useFormFactor,
} from "../src/style/responsive.ts";
import { resizeViewport } from "./viewport.ts";

afterEach(cleanup);

describe("responsive() pure picker", () => {
  const map = { base: "desktop", md: "mid", sm: "phone" } as const;

  it("is desktop-first: smallest matching breakpoint wins, base above all", () => {
    expect(responsive(320, map)).toBe("phone");
    expect(responsive(640, map)).toBe("phone"); // at the threshold: applies at this width and below
    expect(responsive(641, map)).toBe("mid");
    expect(responsive(768, map)).toBe("mid");
    expect(responsive(769, map)).toBe("desktop");
    expect(responsive(1024, map)).toBe("desktop");
    expect(responsive(1280, map)).toBe("desktop");
  });

  it("skips breakpoints absent from the map", () => {
    // No sm entry: a phone width falls through to the next declared key.
    expect(responsive(320, { base: "desktop", lg: "narrowish" })).toBe("narrowish");
    expect(responsive(1025, { base: "desktop", lg: "narrowish" })).toBe("desktop");
  });

  it("resolves an unknown viewport (width <= 0: SSR, pre-layout frame) to base, the desktop variant", () => {
    expect(responsive(0, map)).toBe("desktop");
    expect(responsive(-1, map)).toBe("desktop");
  });
});

describe("formFactor()", () => {
  it("maps widths to phone (<= 640) / tablet (<= 1024) / desktop (above)", () => {
    expect(formFactor(320)).toBe("phone");
    expect(formFactor(640)).toBe("phone");
    expect(formFactor(641)).toBe("tablet");
    expect(formFactor(1024)).toBe("tablet");
    expect(formFactor(1025)).toBe("desktop");
    expect(formFactor(1600)).toBe("desktop");
  });

  it("treats the unknown viewport as desktop", () => {
    expect(formFactor(0)).toBe("desktop");
  });
});

function BucketProbe({ onRender }: { onRender?: () => void }) {
  onRender?.();
  const bucket = useBreakpoint();
  return <div data-testid="bucket">{bucket}</div>;
}

function ValueProbe() {
  const value = useResponsive({ base: "desktop", md: "mid", sm: "phone" });
  const factor = useFormFactor();
  return (
    <div>
      <div data-testid="value">{value}</div>
      <div data-testid="factor">{factor}</div>
    </div>
  );
}

describe("useBreakpoint store", () => {
  it("tracks the bucket across resizes, including width 0 -> base (desktop)", () => {
    render(
      <ThemeProvider>
        <BucketProbe />
      </ThemeProvider>,
    );
    // The harness default 1280 sits AT the xl threshold (applies at this width and below).
    expect(screen.getByTestId("bucket").textContent).toBe("xl");
    resizeViewport(375);
    expect(screen.getByTestId("bucket").textContent).toBe("sm");
    resizeViewport(1600);
    expect(screen.getByTestId("bucket").textContent).toBe("base");
    resizeViewport(0);
    expect(screen.getByTestId("bucket").textContent).toBe("base");
  });

  it("re-renders only when the bucket changes, not per resize pixel", () => {
    let renders = 0;
    render(
      <ThemeProvider>
        <BucketProbe onRender={() => { renders += 1; }} />
      </ThemeProvider>,
    );
    const after = renders;
    // 1280 -> 1100 -> 1030 all stay inside the xl bucket (1024 < w <= 1280).
    resizeViewport(1100);
    resizeViewport(1030);
    expect(renders).toBe(after);
    // Crossing into lg re-renders exactly once.
    resizeViewport(1000);
    expect(renders).toBe(after + 1);
    expect(screen.getByTestId("bucket").textContent).toBe("lg");
  });
});

describe("useResponsive / useFormFactor through the store", () => {
  it("resolves the same values the pure picker resolves at each width", () => {
    render(
      <ThemeProvider>
        <ValueProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("value").textContent).toBe("desktop");
    expect(screen.getByTestId("factor").textContent).toBe("desktop");
    resizeViewport(700);
    expect(screen.getByTestId("value").textContent).toBe("mid");
    expect(screen.getByTestId("factor").textContent).toBe("tablet");
    resizeViewport(375);
    expect(screen.getByTestId("value").textContent).toBe("phone");
    expect(screen.getByTestId("factor").textContent).toBe("phone");
    resizeViewport(0);
    expect(screen.getByTestId("value").textContent).toBe("desktop");
    expect(screen.getByTestId("factor").textContent).toBe("desktop");
  });
});
