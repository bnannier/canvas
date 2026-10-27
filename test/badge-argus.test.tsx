import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);
test("a small badge takes the hand-off's small pill", () => {
  render(<ThemeProvider light><Badge small soft primary testID="badge">Ready</Badge></ThemeProvider>);
  const root = screen.getByTestId("badge");
  expect(root.style.height).toBe("18px");
  expect(root.style.paddingLeft).toBe("6px");
  expect(screen.getByText("Ready").style.fontSize).toBe("11px");
  expect(screen.getByText("Ready").style.lineHeight).toBe("14px");
});
test("reference keys retain their linked accessible label and take the underlined key", () => {
  render(<ThemeProvider light><Badge reference large href="https://example.com" accessibilityLabel="Open CORE-1">CORE-1</Badge></ThemeProvider>);
  expect(screen.getByRole("link", { name: "Open CORE-1" })).toBeTruthy();
  const label = screen.getByText("CORE-1").style;
  expect(label.textDecorationLine || label.textDecoration).toContain("underline");
  expect(label.fontSize).toBe("12px");
});
