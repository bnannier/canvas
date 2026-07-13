import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { devWarn, resetDevWarnings } from "../src/style/dev-warn.ts";
import { Chart, StackedBar, Gauge, Heatmap } from "../src/index.ts";
import { Sparkline } from "../src/atoms/sparkline/sparkline.tsx";

// The kit resolves degenerate data silently at runtime (empty series render an
// empty frame, out-of-range values clamp). devWarn surfaces the clearest of
// those misuse cases on the console in DEV, once per unique message. These tests
// lock in both the helper's dedup contract and each wired-up component warning —
// and that valid data stays quiet. Each real message is asserted in exactly one
// test so the module-level once-per-message dedup never masks a later assertion.

const ui = (n: ReactNode) => render(<ThemeProvider>{n}</ThemeProvider>);

let warnSpy: ReturnType<typeof spyOn>;
beforeEach(() => {
  // The dedup cache is process-wide, so another test file rendering the same
  // degenerate data first would swallow these assertions. Clear it before each.
  resetDevWarnings();
  warnSpy = spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
  cleanup();
});

const sawWarning = (substr: string) => warnSpy.mock.calls.some((c) => String(c[0]).includes(substr));
const canvasWarnings = () => warnSpy.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("[canvas]"));

describe("component data-misuse warnings", () => {
  it("Chart warns when data is empty", () => {
    ui(<Chart data={[]} />);
    expect(sawWarning("<Chart />")).toBe(true);
    expect(sawWarning("`data` is empty")).toBe(true);
  });

  it("Sparkline warns when values is empty", () => {
    ui(<Sparkline values={[]} />);
    expect(sawWarning("<Sparkline />")).toBe(true);
    expect(sawWarning("`values` is empty")).toBe(true);
  });

  it("StackedBar warns when segments is empty", () => {
    ui(<StackedBar segments={[]} />);
    expect(sawWarning("<StackedBar />")).toBe(true);
    expect(sawWarning("`segments` is empty")).toBe(true);
  });

  it("StackedBar warns when every segment value is zero", () => {
    ui(<StackedBar segments={[{ label: "A", value: 0 }, { label: "B", value: 0 }]} />);
    expect(sawWarning("all segment values are zero")).toBe(true);
  });

  it("Gauge warns on an out-of-range value but still clamps it to 0–100", () => {
    const { getByText } = ui(<Gauge value={140} />);
    expect(sawWarning("<Gauge />")).toBe(true);
    expect(sawWarning("outside 0–100")).toBe(true);
    // The warning does not replace the clamp: the value still renders as 100%.
    expect(getByText("100%")).toBeDefined();
  });

  it("Heatmap warns when values is empty", () => {
    ui(<Heatmap values={[]} />);
    expect(sawWarning("<Heatmap />")).toBe(true);
    expect(sawWarning("`values` is empty")).toBe(true);
  });

  it("stays silent for valid data across every wired component", () => {
    ui(
      <>
        <Chart data={[{ label: "Mon", value: 3 }]} />
        <Sparkline values={[1, 2, 3]} />
        <StackedBar segments={[{ label: "A", value: 1 }]} />
        <Gauge value={72} />
        <Heatmap values={[0.2, 0.6]} />
      </>,
    );
    expect(canvasWarnings()).toEqual([]);
  });
});

describe("devWarn helper", () => {
  it("warns at most once for a given message", () => {
    const msg = "[canvas] <DevWarnDedupProbe />: unique probe";
    devWarn(true, msg);
    devWarn(true, msg);
    devWarn(true, msg);
    expect(warnSpy.mock.calls.filter((c) => c[0] === msg).length).toBe(1);
  });

  it("does not warn when the condition is false", () => {
    devWarn(false, "[canvas] <DevWarnFalseProbe />: should never surface");
    expect(sawWarning("DevWarnFalseProbe")).toBe(false);
  });
});
