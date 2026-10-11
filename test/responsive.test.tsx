// The viewport half of the responsiveness system (src/style/responsive.tsx):
// the pure desktop-first picker, the shared breakpoint store behind
// useBreakpoint/useResponsive/useFormFactor, the width<=0-means-desktop rule
// (SSR and the pre-layout first frame), and the bucket-granular re-render
// contract. Narrow branches are driven through test/viewport.ts, which mutates
// the stateful visualViewport stub and re-fires RNW's resize listener: the
// exact signal a real browser resize produces.
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { Dimensions } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import {
  responsive,
  resolveFromBucket,
  useResponsive,
  useBreakpoint,
  formFactor,
  useFormFactor,
  BreakpointOverride,
  type Responsive,
} from "../src/style/responsive.tsx";
import { breakpoints, type BreakpointKey } from "../src/style/tokens.ts";
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

describe("BreakpointOverride (the simulation seam)", () => {
  it("pins the bucket for the subtree, overriding the real 1280 window", () => {
    render(
      <ThemeProvider>
        <BreakpointOverride value="sm">
          <BucketProbe />
          <ValueProbe />
        </BreakpointOverride>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("bucket").textContent).toBe("sm");
    expect(screen.getByTestId("value").textContent).toBe("phone");
    expect(screen.getByTestId("factor").textContent).toBe("phone");
  });

  it("null clears the simulation: the real viewport applies again", () => {
    render(
      <ThemeProvider>
        <BreakpointOverride value={null}>
          <BucketProbe />
        </BreakpointOverride>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("bucket").textContent).toBe("xl");
  });

  it("does not leak outside its subtree, and follows a real resize when cleared", () => {
    render(
      <ThemeProvider>
        <BucketProbe />
        <BreakpointOverride value="md">
          <ValueProbe />
        </BreakpointOverride>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("bucket").textContent).toBe("xl"); // outside: real window
    expect(screen.getByTestId("factor").textContent).toBe("tablet"); // inside: simulated
    // The override wins even when the real window resizes underneath it.
    resizeViewport(375);
    expect(screen.getByTestId("bucket").textContent).toBe("sm");
    expect(screen.getByTestId("factor").textContent).toBe("tablet");
  });
});

describe("BreakpointOverride and the viewport subscription", () => {
  it("holds no subscription under an override: real bucket crossings never re-render it", () => {
    let renders = 0;
    render(
      <ThemeProvider>
        <BreakpointOverride value="sm">
          <BucketProbe onRender={() => { renders += 1; }} />
        </BreakpointOverride>
      </ThemeProvider>,
    );
    const after = renders;
    // Three real crossings (xl -> lg -> sm -> base); the simulated answer cannot change.
    resizeViewport(1000);
    resizeViewport(375);
    resizeViewport(1600);
    expect(renders).toBe(after);
    expect(screen.getByTestId("bucket").textContent).toBe("sm");
  });

  it("subscribes again when the override clears, and follows the real window from there", () => {
    function Switch({ bucket }: { bucket: BreakpointKey | "base" | null }) {
      return (
        <ThemeProvider>
          <BreakpointOverride value={bucket}>
            <BucketProbe />
          </BreakpointOverride>
        </ThemeProvider>
      );
    }
    const { rerender } = render(<Switch bucket="md" />);
    expect(screen.getByTestId("bucket").textContent).toBe("md");
    rerender(<Switch bucket={null} />);
    expect(screen.getByTestId("bucket").textContent).toBe("xl");
    resizeViewport(375);
    expect(screen.getByTestId("bucket").textContent).toBe("sm");
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

// Every map the five breakpoint keys can make, each key holding its own name and base
// holding "base": 32 maps, the empty one (base alone) included.
const KEYS: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl"];
const EVERY_MAP: Responsive<string>[] = Array.from({ length: 1 << KEYS.length }, (_, mask) => {
  const map: Responsive<string> = { base: "base" };
  KEYS.forEach((key, i) => {
    if (mask & (1 << i)) map[key] = key;
  });
  return map;
});
// The bucket each width sits in, read straight off the token scale (the oracle).
const bucketAt = (width: number): BreakpointKey | "base" =>
  width <= 0 ? "base" : (KEYS.find((bp) => width <= breakpoints[bp]) ?? "base");

describe("resolveFromBucket", () => {
  it("equals responsive(width) at every width up to 1600, for every map the five keys make", () => {
    for (let width = 0; width <= 1600; width += 1) {
      const bucket = bucketAt(width);
      for (const map of EVERY_MAP) expect(resolveFromBucket(bucket, map)).toBe(responsive(width, map));
    }
  });

  it("is what useResponsive resolves through the store across a whole resize sweep", () => {
    function Reading({ map }: { map: Responsive<string> }) {
      return <span>{`${useResponsive(map)};`}</span>;
    }
    render(
      <ThemeProvider>
        <div data-testid="sweep">
          {EVERY_MAP.map((map, i) => <Reading key={i} map={map} />)}
        </div>
      </ThemeProvider>,
    );
    for (let width = 1600; width >= 0; width -= 7) {
      resizeViewport(width);
      expect(screen.getByTestId("sweep").textContent).toBe(EVERY_MAP.map((map) => `${responsive(width, map)};`).join(""));
    }
  });
});

describe("the shared viewport subscription", () => {
  // Counts the Dimensions listeners the store holds: attached when the first consumer
  // subscribes, shared by every other, detached when the last one leaves.
  function countDimensionsListeners() {
    const original = Dimensions.addEventListener;
    const counts = { attached: 0, live: 0 };
    Dimensions.addEventListener = ((type: "change", handler: Parameters<typeof original>[1]) => {
      const subscription = original.call(Dimensions, type, handler);
      counts.attached += 1;
      counts.live += 1;
      return {
        remove() {
          counts.live -= 1;
          subscription.remove();
        },
      };
    }) as typeof original;
    return { counts, restore: () => { Dimensions.addEventListener = original; } };
  }

  it("adds one Dimensions listener for any number of consumers, and removes it with the last", () => {
    const { counts, restore } = countDimensionsListeners();
    try {
      const first = render(<BucketProbe />);
      const second = render(<BucketProbe />);
      const third = render(<ValueProbe />);
      expect(counts.attached).toBe(1);
      expect(counts.live).toBe(1);
      // Every consumer still hears the one listener.
      resizeViewport(375);
      expect(first.container.textContent).toBe("sm");
      expect(second.container.textContent).toBe("sm");
      expect(third.container.textContent).toBe("phonephone");
      first.unmount();
      second.unmount();
      expect(counts.live).toBe(1);
      third.unmount();
      expect(counts.live).toBe(0);
      // A later consumer attaches a fresh one.
      const fourth = render(<BucketProbe />);
      expect(counts.attached).toBe(2);
      expect(counts.live).toBe(1);
      fourth.unmount();
      // Consumers under an override hold none.
      render(
        <BreakpointOverride value="sm">
          <BucketProbe />
          <ValueProbe />
        </BreakpointOverride>,
      );
      expect(counts.live).toBe(0);
    } finally {
      cleanup();
      restore();
    }
  });
});
