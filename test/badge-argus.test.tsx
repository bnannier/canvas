import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";
afterEach(cleanup);
test("dense badges retain Argus metrics", () => {
  render(<ThemeProvider light><Badge small soft primary testID="badge">Ready</Badge></ThemeProvider>);
  const root = screen.getByTestId("badge");
  expect(root.style.padding).toBe("3px 8px");
  expect(screen.getByText("Ready").style.fontSize).toBe("10px");
  expect(screen.getByText("Ready").style.lineHeight).toBe("13px");
});
test("reference keys retain their linked accessible label and tracking", () => {
  render(<ThemeProvider light><Badge reference large href="https://example.com" accessibilityLabel="Open CORE-1">CORE-1</Badge></ThemeProvider>);
  expect(screen.getByRole("link", { name: "Open CORE-1" })).toBeTruthy();
  expect(screen.getByText("CORE-1").style.letterSpacing).toBe("0.44px");
  expect(screen.getByText("CORE-1").style.lineHeight).toBe("14.3px");
});
