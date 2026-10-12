import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Platform, StyleSheet, Text as RNText, type TextStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { numeralsOf } from "../src/atoms/typography/typography.shared.tsx";

// Typography's numerals axis (`tabular`, audit K12-2 tabular): tabular figures for numbers
// read down a column or updated in place, so apps keep them once the tabularNums helper is
// deprecated. The web branch is asserted in the DOM; react-native-web drops React Native's
// `fontVariant`, so the native branch is asserted on the style the shell hands React
// Native's Text, read off its fiber, with Platform.OS switched for the render.

afterEach(cleanup);

const ui = (node: React.ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

/** The flattened style the shell handed React Native's own Text (the native view). */
function nativeTextStyle(container: Element): TextStyle {
  const key = Object.keys(container).find((k) => k.startsWith("__reactContainer$"));
  if (!key) throw new Error("no React root on the container");
  type Fiber = { elementType: unknown; stateNode: unknown; memoizedProps: Record<string, unknown> | null; child: Fiber | null; sibling: Fiber | null };
  // The container keeps the root's first fiber; the root itself points at the current tree.
  const root = (container as unknown as Record<string, Fiber>)[key].stateNode as { current: Fiber };
  const stack: (Fiber | null)[] = [root.current];
  while (stack.length) {
    const fiber = stack.pop();
    if (!fiber) continue;
    if (fiber.elementType === RNText) return StyleSheet.flatten(fiber.memoizedProps?.style as TextStyle) ?? {};
    stack.push(fiber.sibling, fiber.child);
  }
  throw new Error("no React Native Text rendered");
}

function onPlatform<T>(os: "ios" | "android", run: () => T): T {
  const original = Object.getOwnPropertyDescriptor(Platform, "OS")!;
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
  try {
    return run();
  } finally {
    Object.defineProperty(Platform, "OS", original);
  }
}

describe("Typography tabular", () => {
  it("is its own single-member axis, off unless passed", () => {
    expect(numeralsOf({})).toBeNull();
    expect(numeralsOf({ tabular: true })).toBe("tabular");
    expect(numeralsOf({ tabular: true, mono: true, semibold: true })).toBe("tabular");
  });

  it("sets tabular figures on the web, and leaves prose its proportional ones", () => {
    const { getByText } = ui(
      <>
        <Typography tabular>1,204,118</Typography>
        <Typography>Your 14 invoices</Typography>
      </>,
    );
    expect(getByText("1,204,118").getAttribute("style")).toContain("font-variant-numeric: tabular-nums");
    expect(getByText("Your 14 invoices").getAttribute("style") ?? "").not.toContain("variant");
  });

  it("combines with every other axis without changing them", () => {
    const declarations = (style: string | null) => new Set((style ?? "").split(";").map((d) => d.trim()).filter(Boolean));
    const { getByText } = ui(
      <>
        <Typography small subtle semibold tabular>11,407</Typography>
        <Typography small subtle semibold>11,407 plain</Typography>
      </>,
    );
    const tabular = declarations(getByText("11,407").getAttribute("style"));
    const plain = declarations(getByText("11,407 plain").getAttribute("style"));
    // Only the figure width changes: the size, colour and weight are the same declarations.
    expect([...tabular].filter((d) => !plain.has(d))).toEqual(["font-variant-numeric: tabular-nums"]);
    expect([...plain].filter((d) => !tabular.has(d))).toEqual([]);
  });

  for (const os of ["ios", "android"] as const) {
    it(`hands React Native's fontVariant to the native Text on ${os}`, () => {
      const tabular = onPlatform(os, () => nativeTextStyle(ui(<Typography tabular>99.982%</Typography>).container));
      expect(tabular.fontVariant).toEqual(["tabular-nums"]);
      expect((tabular as Record<string, unknown>).fontVariantNumeric).toBeUndefined();
      cleanup();
      const prose = onPlatform(os, () => nativeTextStyle(ui(<Typography>99.982%</Typography>).container));
      expect(prose.fontVariant).toBeUndefined();
    });
  }
});
