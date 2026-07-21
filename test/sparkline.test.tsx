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

  it("an empty series renders the named empty strip in both variants (never throws)", () => {
    for (const line of [false, true]) {
      const { container, unmount } = ui(<Sparkline line={line} values={[]} />);
      expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("Sparkline: no data");
      unmount();
    }
  });

  it("a flat series still renders the line variant", () => {
    const { container } = ui(<Sparkline line values={[5, 5, 5]} />);
    expect(container.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain("latest 5");
  });
});

describe("Sparkline accent", () => {
  const barsOf = (container: HTMLElement) => Array.from(container.querySelector('[role="img"]')?.children ?? []) as HTMLElement[];

  it("the last bar wears the accent; the rest share the wash", () => {
    const { container } = ui(<Sparkline values={[4, 8, 6]} />);
    const [a, b, c] = barsOf(container);
    expect(a.style.backgroundColor).toBe(b.style.backgroundColor);
    expect(c.style.backgroundColor).not.toBe(a.style.backgroundColor);
  });

  it("a trailing non-finite bucket never wears the accent (the last finite bar does)", () => {
    const { container } = ui(<Sparkline values={[4, 8, Number.NaN]} />);
    const [a, b, c] = barsOf(container);
    expect(b.style.backgroundColor).not.toBe(a.style.backgroundColor);
    expect(c.style.backgroundColor).toBe(a.style.backgroundColor);
  });
});
