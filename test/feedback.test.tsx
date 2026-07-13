import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Progress } from "../src/atoms/progress/progress.tsx";
import { Progress as ProgressAndroid } from "../src/atoms/progress/progress.android.tsx";
import { Progress as ProgressIOS } from "../src/atoms/progress/progress.ios.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

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
    // at the trailing edge. The container goes transparent (each segment paints
    // itself) and the dot is the only fixed 4x4 child.
    const { container } = ui(<ProgressAndroid value={0.5} testID="pa" />);
    const root = container.querySelector('[data-testid="pa"]') as HTMLElement;
    expect(root.style.backgroundColor).toBe("");
    const dot = Array.from(root.querySelectorAll("div")).find(
      (el) => el.style.width === "4px" && el.style.height === "4px",
    );
    expect(dot).toBeDefined();
  });

  it("Android indeterminate keeps the continuous rail (no stop indicator)", () => {
    const { container } = ui(<ProgressAndroid indeterminate testID="pi" />);
    const root = container.querySelector('[data-testid="pi"]') as HTMLElement;
    expect(root.style.backgroundColor).not.toBe("");
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
