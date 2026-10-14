import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

test("preserves Argus's exact eyebrow metrics and accessible title", () => {
  render(<ThemeProvider light><Typography eyebrow bold labelLeading uppercase wideTracking accessibilityRole="header">Factory</Typography></ThemeProvider>);
  const label = screen.getByRole("heading", { name: "Factory" });
  expect(label.style.fontSize).toBe("9.5px");
  expect(label.style.lineHeight).toBe("12.35px");
  expect(label.style.letterSpacing).toBe("1.52px");
  expect(label.style.textTransform).toBe("uppercase");
});

test("a muted tone does not replace an explicit small reading role", () => {
  render(<ThemeProvider light><Typography tiny bold bodyLeading muted>v2.3</Typography></ThemeProvider>);
  expect(screen.getByText("v2.3").style.fontSize).toBe("11px");
  expect(screen.getByText("v2.3").style.lineHeight).toBe("16.5px");
});

test("preserves compact lockups, extra-bold metrics and explicit accessible names", () => {
  render(<ThemeProvider light><Typography label extraBold lockupLeading accessibilityLabel="Current spend">$412</Typography></ThemeProvider>);
  const label = screen.getByLabelText("Current spend");
  expect(label.style.lineHeight).toBe("13.8px");
  expect(label.style.fontWeight).toBe("800");
});
