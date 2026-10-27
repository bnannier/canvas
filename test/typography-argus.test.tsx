import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { ThemeProvider } from "../src/style/theme.tsx";

afterEach(cleanup);

// The leading and tracking props resolve against the role's own size: the v4 eyebrow is 11px
// (the hand-off's mono eyebrow), so the label leading is 11 x 1.3 and the wide tracking 11 x 0.16.
test("resolves the eyebrow's exact metrics and keeps its accessible title", () => {
  render(<ThemeProvider light><Typography eyebrow bold labelLeading uppercase wideTracking accessibilityRole="header">Factory</Typography></ThemeProvider>);
  const label = screen.getByRole("heading", { name: "Factory" });
  expect(label.style.fontSize).toBe("11px");
  expect(label.style.lineHeight).toBe("14.3px");
  expect(label.style.letterSpacing).toBe("1.76px");
  expect(label.style.textTransform).toBe("uppercase");
});

test("a muted tone does not replace an explicit small reading role", () => {
  render(<ThemeProvider light><Typography tiny bold bodyLeading muted>v2.3</Typography></ThemeProvider>);
  expect(screen.getByText("v2.3").style.fontSize).toBe("11px");
  expect(screen.getByText("v2.3").style.lineHeight).toBe("16.5px");
});

// The v4 label is 13px, so the lockup leading is 13 x 1.15.
test("preserves compact lockups, extra-bold metrics and explicit accessible names", () => {
  render(<ThemeProvider light><Typography label extraBold lockupLeading accessibilityLabel="Current spend">$412</Typography></ThemeProvider>);
  const label = screen.getByLabelText("Current spend");
  expect(label.style.lineHeight).toBe("14.95px");
  expect(label.style.fontWeight).toBe("800");
});

test("section headings own their count, metadata and trailing action", () => {
  render(<ThemeProvider light solid><Typography section subheading bold labelLeading count={3} description="Waiting for a signature" actions={<button>Review</button>}>Needs a human</Typography></ThemeProvider>);
  expect(screen.getByRole("heading", { name: "Needs a human" })).toBeTruthy();
  expect(screen.getByText("3")).toBeTruthy();
  expect(screen.getByText("Waiting for a signature").style.lineHeight).toBe("16.1px");
  expect(screen.getByRole("button", { name: "Review" })).toBeTruthy();
});
