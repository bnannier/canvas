import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Slider } from "../src/atoms/slider/slider.tsx";
import { Progress } from "../src/atoms/progress/progress.tsx";

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
