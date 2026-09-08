import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { createBadge } from "../src/atoms/badge/badge.shared.tsx";
import * as badgeSkins from "../src/atoms/badge/badge.styles.ts";
import { createAlert } from "../src/molecules/alert/alert.shared.tsx";
import * as alertSkins from "../src/molecules/alert/alert.styles.ts";
import { colorsByScheme, type ColorTokens } from "../src/style/tokens.ts";
import { androidSkin, iosSkin, webSkin } from "../src/atoms/button/button.styles.ts";
import { blockDeclarations, cssColorToHex } from "../tools/tokens/css-tokens.ts";

afterEach(cleanup);

function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Expected an opaque sRGB color: ${hex}`);
  const [r, g, b] = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function contrast(a: string, b: string): number {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

const PAIRS: [keyof ColorTokens, keyof ColorTokens][] = [
  ["background", "foreground"], ["card", "card-foreground"], ["popover", "popover-foreground"],
  ["primary", "primary-foreground"], ["secondary", "secondary-foreground"], ["muted", "muted-foreground"],
  ["accent", "accent-foreground"], ["destructive", "destructive-foreground"],
  ["success", "success-foreground"], ["warning", "warning-foreground"],
];
const css = readFileSync(new URL("../styles/tokens/colors.css", import.meta.url), "utf8");

describe("normal text contrast (WCAG 1.4.3)", () => {
  it("uses the WCAG linear-light calculation", () => {
    expect(contrast("#000000", "#ffffff")).toBe(21);
    expect(contrast("#ffffff", "#ffffff")).toBe(1);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.478, 3);
  });

  for (const scheme of ["light", "dark"] as const) {
    const tokens = colorsByScheme[scheme];
    const declarations = blockDeclarations(css, scheme === "light" ? ":root" : ".dark").decls;
    for (const [fill, foreground] of PAIRS) {
      it(`keeps ${scheme} ${foreground} at 4.5:1 on its fill in both RN and CSS`, () => {
        expect(contrast(tokens[fill], tokens[foreground])).toBeGreaterThanOrEqual(4.5);
        const cssFill = cssColorToHex(declarations[fill]);
        const cssForeground = cssColorToHex(declarations[foreground]);
        expect(cssFill).toBe(tokens[fill]);
        expect(cssForeground).toBe(tokens[foreground]);
        expect(contrast(cssFill!, cssForeground!)).toBeGreaterThanOrEqual(4.5);
        // Engines can round converted oklch channels differently. Check the
        // entire +/-1 fill-channel neighborhood, including combined changes.
        const channels = [1, 3, 5].map((i) => parseInt(tokens[fill].slice(i, i + 2), 16));
        for (const dr of [-1, 0, 1]) for (const dg of [-1, 0, 1]) for (const db of [-1, 0, 1]) {
          const rounded = "#" + channels.map((value, i) =>
            Math.min(255, Math.max(0, value + [dr, dg, db][i]!)).toString(16).padStart(2, "0"),
          ).join("");
          expect(contrast(rounded, tokens[foreground])).toBeGreaterThanOrEqual(4.5);
        }
      });
    }

    for (const [platform, skin] of Object.entries({ web: webSkin, ios: iosSkin, android: androidSkin })) {
      it(`keeps every resting ${scheme} ${platform} filled Button label readable at every size`, () => {
        for (const size of ["small", "base", "large"] as const) {
          for (const intent of ["primary", "secondary", "destructive"] as const) {
            const fill = skin.container(tokens, intent, size, { icon: false, block: false, dim: false }).backgroundColor;
            const foreground = skin.label(tokens, intent, size).color;
            expect(contrast(fill as string, foreground as string)).toBeGreaterThanOrEqual(4.5);
          }
        }
      });
    }
  }
});

const renderedPlatforms = [
  { name: "web", Badge: createBadge(badgeSkins.webSkin), Alert: createAlert(alertSkins.webSkin) },
  { name: "ios", Badge: createBadge(badgeSkins.iosSkin), Alert: createAlert(alertSkins.iosSkin) },
  { name: "android", Badge: createBadge(badgeSkins.androidSkin), Alert: createAlert(alertSkins.androidSkin) },
];
const hexOf = (color: string): string => {
  if (/^#[\da-f]{6}$/i.test(color)) return color;
  const channels = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*1(?:\.0+)?)?\s*\)$/.exec(color);
  if (!channels) throw new Error(`Expected an opaque rendered color: ${color}`);
  return "#" + channels.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("");
};

for (const scheme of ["light", "dark"] as const) {
  for (const { name, Badge, Alert } of renderedPlatforms) {
    it(`keeps actual ${scheme} ${name} Badge and Alert status text readable`, () => {
      for (const tone of ["neutral", "success", "warning", "error", "info"] as const) {
        const toneProps = tone === "neutral" ? {} : { [tone]: true };
        const view = render(<ThemeProvider scheme={scheme}>
          <Badge status {...toneProps} testID="badge">Status</Badge>
          <Alert {...toneProps} title="Title" description="Description" testID="alert" />
        </ThemeProvider>);
        for (const [id, labels] of [["badge", ["Status"]], ["alert", ["Title", "Description"]]] as const) {
          const fill = hexOf(screen.getByTestId(id).style.backgroundColor);
          for (const label of labels) {
            const text = hexOf(screen.getByText(label).style.color);
            expect(contrast(fill, text)).toBeGreaterThanOrEqual(4.5);
          }
        }
        view.unmount();
      }
    });
  }
}
