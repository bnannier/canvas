import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

// The resolved line height of the single Text a Typography renders.
const lineHeightOf = (container: HTMLElement) => {
  const el = container.firstElementChild as HTMLElement;
  return getComputedStyle(el).lineHeight;
};

describe("Typography leading axis", () => {
  it("tightLeading pulls a role's reading line box in to 1.25x", () => {
    // lead is 16/24 (a 1.5 reading ratio); tight caps it at round(16 * 1.25) = 20.
    expect(lineHeightOf(ui(<Typography lead>Canvas</Typography>).container)).toBe("24px");
    expect(lineHeightOf(ui(<Typography lead tightLeading>Canvas</Typography>).container)).toBe("20px");

    // tiny is 12/16; tight caps it at round(12 * 1.25) = 15.
    expect(lineHeightOf(ui(<Typography tiny>design system</Typography>).container)).toBe("16px");
    expect(lineHeightOf(ui(<Typography tiny tightLeading>design system</Typography>).container)).toBe("15px");
  });

  it("only ever tightens: roles already at or below 1.25x keep their own line box", () => {
    // The display scale is already tight (display 48/48 = 1.0, h1 36/40 = 1.11,
    // h2 30/36 = 1.2). Without the min() clamp the ratio would LOOSEN these, so the
    // prop would be unsafe on the roles most likely to carry a lockup's first line.
    for (const [node, expected] of [
      [<Typography display tightLeading>Canvas</Typography>, "48px"],
      [<Typography h1 tightLeading>Canvas</Typography>, "40px"],
      [<Typography h2 tightLeading>Canvas</Typography>, "36px"],
    ] as const) {
      expect(lineHeightOf(ui(node).container)).toBe(expected);
    }
  });

  it("is orthogonal: it changes the line box and nothing else", () => {
    const plain = ui(<Typography lead semibold>Canvas</Typography>).container.firstElementChild as HTMLElement;
    const tight = ui(<Typography lead semibold tightLeading>Canvas</Typography>).container
      .firstElementChild as HTMLElement;
    const a = getComputedStyle(plain);
    const b = getComputedStyle(tight);
    expect(b.fontSize).toBe(a.fontSize);
    expect(b.fontWeight).toBe(a.fontWeight);
    expect(b.color).toBe(a.color);
    expect(b.lineHeight).not.toBe(a.lineHeight);
  });

  it("omitting it leaves the role's reading leading untouched", () => {
    expect(lineHeightOf(ui(<Typography body>The quick brown fox</Typography>).container)).toBe("28px");
    expect(lineHeightOf(ui(<Typography lead>The quick brown fox</Typography>).container)).toBe("24px");
  });
});
