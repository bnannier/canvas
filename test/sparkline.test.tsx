import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Sparkline } from "../src/atoms/sparkline/sparkline.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Sparkline accessible name", () => {
  it("derives a data summary when no accessibilityLabel is given (never an unnamed role=img)", () => {
    const { container } = ui(<Sparkline values={[3, 1, 4, 5]} />);
    const img = container.querySelector('[role="img"]') as HTMLElement;
    const label = img.getAttribute("aria-label") ?? "";
    expect(label).toContain("4 points");
    expect(label).toContain("from 1 to 5");
    expect(label).toContain("latest 5");
  });

  it("uses the explicit accessibilityLabel when provided", () => {
    const { container } = ui(<Sparkline values={[1, 2]} accessibilityLabel="Revenue trend" />);
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Revenue trend");
  });

  it("the line variant is named too", () => {
    const { container } = ui(<Sparkline line values={[10, 20, 15]} />);
    const label = container.querySelector('[role="img"]')?.getAttribute("aria-label") ?? "";
    expect(label).toContain("3 points");
  });
});
