import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar } from "../src/atoms/avatar/avatar.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);

test("retains the existing inline identity annotation without changing other text roles", () => {
  render(<ThemeProvider light solid><Avatar annotation whiteInk bold initials="C" hue={115} /></ThemeProvider>);
  const glyph = screen.getByText("C");
  expect(glyph.style.fontSize).toBe("9px");
  expect(glyph.style.lineHeight).toBe("9px");
  expect(glyph.style.fontWeight).toBe("700");
  expect(glyph.style.color).toMatch(/255, ?255, ?255/);
  expect(glyph.parentElement!.style.width).toBe("16px");
});

test("the sheen occupies its reference bounds around the identity disc", () => {
  render(<ThemeProvider light solid><Avatar hero strongSheen whiteInk initials="M" hue={255} /></ThemeProvider>);
  const disc = screen.getByText("M").parentElement!;
  expect(disc.style.width).toBe("58px");
  expect(disc.parentElement!.style.width).toBe("64px");
  expect(disc.parentElement!.style.height).toBe("64px");
});
