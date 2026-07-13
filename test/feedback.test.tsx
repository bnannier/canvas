import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { render, cleanup, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Progress } from "../src/atoms/progress/progress.tsx";
import { Progress as ProgressAndroid } from "../src/atoms/progress/progress.android.tsx";
import { Progress as ProgressIOS } from "../src/atoms/progress/progress.ios.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// Render inside an async act so useReducedMotion's async AccessibilityInfo read (a state
// update) settles within act, matching progress.test.tsx.
async function wrap(node: ReactNode) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(<ThemeProvider>{node}</ThemeProvider>);
  });
  return result;
}

// happy-dom has no ResizeObserver, so RNW's onLayout never fires on its own. Fire the layout
// handler RNW attaches to the (inner) progressbar node, giving the shell a real track width so
// the measured-width branches (the eased fill AND the leading-edge glow) render.
function fireLayout(el: Element, width: number) {
  const h = (el as unknown as { __reactLayoutHandler?: (e: unknown) => void }).__reactLayoutHandler;
  if (typeof h !== "function") throw new Error("no __reactLayoutHandler on the progressbar (RNW layout hook absent)");
  act(() => h({ nativeEvent: { layout: { x: 0, y: 0, width, height: 8, left: 0, top: 0 } }, timeStamp: 1 }));
}

describe("Slider", () => {
  it("exposes its value + range to assistive tech", () => {
    const { container } = ui(<Slider value={40} min={0} max={100} />);
    const adj = container.querySelector("[aria-valuenow]");
    expect(adj).not.toBeNull();
    expect(adj?.getAttribute("aria-valuenow")).toBe("40");
    expect(adj?.getAttribute("aria-valuemin")).toBe("0");
    expect(adj?.getAttribute("aria-valuemax")).toBe("100");
  });

  it("renders a disabled slider without crashing", () => {
    expect(() => ui(<Slider value={10} disabled />)).not.toThrow();
  });
});

describe("Progress", () => {
  it("reports a determinate value as a progressbar", () => {
    const { container } = ui(<Progress value={0.6} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("aria-valuenow")).toBe("60");
  });

  it("omits the value when indeterminate", () => {
    const { container } = ui(<Progress indeterminate />);
    expect(container.querySelector("[aria-valuenow]")).toBeNull();
  });
});

describe("Progress per-OS anatomy", () => {
  it("Android determinate renders the M3 segmented track with the 4x4 stop indicator", () => {
    // M3 anatomy: active indicator + 4dp gap + track + 4x4dp stop indicator dot
    // at the trailing edge. The inner (progressbar) track goes transparent (each
    // segment paints itself) and the dot is the only fixed 4x4 descendant. testID
    // now sits on the non-clipping OUTER wrapper, so read the track off role.
    const { container } = ui(<ProgressAndroid value={0.5} testID="pa" />);
    const root = container.querySelector('[data-testid="pa"]') as HTMLElement;
    const track = root.querySelector('[role="progressbar"]') as HTMLElement;
    expect(track.style.backgroundColor).toBe("");
    const dot = Array.from(root.querySelectorAll("div")).find(
      (el) => el.style.width === "4px" && el.style.height === "4px",
    );
    expect(dot).toBeDefined();
  });

  it("Android indeterminate keeps the continuous rail (no stop indicator)", () => {
    const { container } = ui(<ProgressAndroid indeterminate testID="pi" />);
    const root = container.querySelector('[data-testid="pi"]') as HTMLElement;
    const track = root.querySelector('[role="progressbar"]') as HTMLElement;
    expect(track.style.backgroundColor).not.toBe("");
    const dot = Array.from(root.querySelectorAll("div")).find(
      (el) => el.style.width === "4px" && el.style.height === "4px",
    );
    expect(dot).toBeUndefined();
  });

  it("iOS indeterminate renders the kit Spinner instead of a sliding bar", () => {
    // iOS has no linear indeterminate idiom; the iOS entry threads the kit
    // Spinner, which announces itself as an unlabeled-progress control.
    const { container } = ui(<ProgressIOS indeterminate />);
    expect(container.querySelector("[aria-valuemin]")).toBeNull();
    expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it("iOS determinate stays a value bar (the spinner swap is indeterminate-only)", () => {
    const { container } = ui(<ProgressIOS value={0.6} />);
    expect(container.querySelector("[aria-valuenow]")?.getAttribute("aria-valuenow")).toBe("60");
  });
});

describe("Progress leading-edge glow", async () => {
  it("determinate renders the glow overlay in the non-clipping outer wrapper", async () => {
    // The glow is a spring-driven bloom at the fill's leading edge; it renders once the
    // track is measured (trackWidth > 0), as a testID-suffixed node OUTSIDE the clipped
    // progressbar track so its boxShadow can bloom past the rail.
    const { container } = await wrap(<Progress value={0.5} testID="pg" />);
    const track = container.querySelector('[role="progressbar"]')!;
    fireLayout(track, 320);
    const glow = container.querySelector('[data-testid="pg-glow"]') as HTMLElement;
    expect(glow).not.toBeNull();
    // It is a sibling of the track (in the outer wrapper), not a child of the clipped rail.
    expect(track.contains(glow)).toBe(false);
  });

  it("indeterminate renders NO glow (there is no leading edge to trail)", async () => {
    const { container } = await wrap(<Progress indeterminate testID="pgi" />);
    const track = container.querySelector('[role="progressbar"]')!;
    fireLayout(track, 320);
    expect(container.querySelector('[data-testid="pgi-glow"]')).toBeNull();
  });

  it("reduced motion drops the glow overlay (a pure decorative flourish)", async () => {
    const spy = spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockReturnValue(Promise.resolve(true));
    const { container } = await wrap(<Progress value={0.5} testID="pgr" />);
    await act(async () => {}); // let the reduce-motion read resolve
    const track = container.querySelector('[role="progressbar"]')!;
    fireLayout(track, 320);
    expect(container.querySelector('[data-testid="pgr-glow"]')).toBeNull();
    spy.mockRestore();
  });
});
