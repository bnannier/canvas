import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Text } from "react-native";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { ThemeProvider, useTheme } from "../src/style/theme.tsx";
import { resolveMaterial, type MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";
afterEach(cleanup);

const solid = { surface: "solid", reducedTransparency: false, increasedContrast: false } as const;
const web: MaterialCapabilities = { platform: "web", frost: true, liquid: false, requiresTarget: false };

test("explicit frame and veil frost keep capability and accessibility fallbacks", () => {
  for (const options of [{ frosted: true }, { veil: true }]) {
    expect(resolveMaterial(solid, options, web, false).renderer).toBe("frost");
    expect(resolveMaterial({ ...solid, reducedTransparency: true }, options, web, false)).toMatchObject({ renderer: "solid", fallback: "transparency" });
    expect(resolveMaterial({ ...solid, increasedContrast: true }, options, web, false)).toMatchObject({ renderer: "solid", fallback: "contrast" });
    expect(resolveMaterial(solid, options, { ...web, frost: false }, false)).toMatchObject({ renderer: "solid", fallback: "unavailable" });
    expect(resolveMaterial(solid, options, { ...web, platform: "android", requiresTarget: true }, false)).toMatchObject({ renderer: "solid", fallback: "missing-target" });
    expect(resolveMaterial(solid, options, { ...web, platform: "ios", liquid: true }, false).renderer).toBe("frost");
  }
});

test("frame frost keeps controls solid and paints the exact frame or veil blur on its stable host", () => {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => true }, configurable: true });
  function Child() { return <Text>{useTheme().surface}</Text>; }
  try {
    const { getByTestId, getByText, rerender } = render(<ThemeProvider solid><GlassSurface frosted tint="rgba(255,255,255,0.52)" style={{ backgroundColor: "#ffffff" }} testID="frame"><Child /></GlassSurface></ThemeProvider>);
    const frame = getByTestId("frame");
    expect(frame.style.backdropFilter).toBe("blur(24px)");
    expect(getByText("solid")).toBeTruthy();
    rerender(<ThemeProvider solid><GlassSurface veil tint="rgba(40,30,90,0.28)" style={{ backgroundColor: "#ffffff" }} testID="frame"><Child /></GlassSurface></ThemeProvider>);
    expect(getByTestId("frame")).toBe(frame);
    expect(frame.style.backdropFilter).toBe("blur(2px)");
    expect(getByText("solid")).toBeTruthy();
  } finally {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  }
});
