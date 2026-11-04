import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Typography as IosTypography } from "../src/atoms/typography/typography.ios.tsx";
import { Typography as AndroidTypography } from "../src/atoms/typography/typography.android.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
import { MONO_FONT, TERMINAL_FONT } from "../src/style/mono.ts";
import { fontStyle } from "../src/style/text.tsx";

afterEach(cleanup);

test.each([["web", Typography], ["ios", IosTypography], ["android", AndroidTypography]] as const)("%s terminal typography keeps reading sizes, ink, weight and heading semantics", (_platform, Type) => {
  render(<ThemeProvider light solid><Type terminal tiny muted>Keyboard help</Type><Type terminal small bold>Model</Type><Type terminal h5>Session</Type><Type mono>Regular mono</Type></ThemeProvider>);
  const hint = screen.getByText("Keyboard help");
  expect(hint.style.fontSize).toBe("11px");
  expect(hint.style.fontFamily).toBe(TERMINAL_FONT);
  expect(screen.getByText("Model").style.fontSize).toBe("13px");
  expect(screen.getByText("Model").style.fontWeight).toBe("700");
  expect(screen.getByRole("heading", { level: 5 }).style.fontFamily).toBe(TERMINAL_FONT);
  expect(screen.getByText("Regular mono").style.fontFamily).toContain(MONO_FONT);
});

test("the web terminal stack remains a family list and does not change registered mono behavior", () => {
  expect(TERMINAL_FONT).toBe("ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace");
  expect(fontStyle({ fontFamily: TERMINAL_FONT }, { sans: "BrandSans", mono: "BrandMono" })).toEqual({ fontFamily: TERMINAL_FONT });
  expect(fontStyle({ fontFamily: MONO_FONT }, { sans: "BrandSans", mono: "BrandMono" })).toEqual([{ fontFamily: MONO_FONT }, { fontFamily: "BrandMono" }]);
});
