import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Typography } from "../src/atoms/typography/typography.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { lookOf as chipLookOf } from "../src/atoms/chip/chip.shared.tsx";
import { webSkin as chipWeb, androidSkin as chipAndroid } from "../src/atoms/chip/chip.styles.ts";
import { elevationOf } from "../src/molecules/card/card.shared.tsx";
import { sizeOf, edgeOf } from "../src/atoms/kbd/kbd.shared.tsx";
import { badgeIntentOf } from "../src/atoms/badge/badge.shared.tsx";
import { toneOf, leadingOf } from "../src/atoms/typography/typography.shared.tsx";
import { SOLVED_INKS } from "../src/style/solved-inks.ts";
import { lightColors, darkColors } from "../src/style/tokens.ts";
import { channelsOf, contrastRatio } from "../src/style/color.ts";

// The section cards' shared kit vocabulary (Canvas v4 section-page parity, wave 0): the
// Chip link pill, the card roles and the `natural` line, the cyan and mint hue tones, the
// sunken Card, the compact Kbd caps and the Input shortcut hint.

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider light>{node}</ThemeProvider>);
const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const sameColor = (a: string, b: string) => {
  const [x, y] = [channelsOf(a), channelsOf(b)];
  return x != null && y != null && x.slice(0, 3).every((v, i) => Math.abs(v - y[i]) <= 1);
};
/** Every computed color painted under a node, by the CSS property named. */
const painted = (root: HTMLElement, prop: "color" | "backgroundColor") =>
  [root, ...root.querySelectorAll<HTMLElement>("*")].map((el) => getComputedStyle(el)[prop]).filter(Boolean);

describe("Typography card roles and the natural line", () => {
  it("cardNote is 400 12 px on the 19.2 line in the third ink", () => {
    const el = first(ui(<Typography cardNote mono>{"<Button primary>"}</Typography>).container);
    const style = getComputedStyle(el);
    expect(style.fontSize).toBe("12px");
    expect(style.lineHeight).toBe("19.2px");
    expect(sameColor(style.color, lightColors["subtle-foreground"] as string)).toBe(true);
  });

  it("natural sets the face's own normal line at the role's size", () => {
    const line = (node: ReactNode) => getComputedStyle(first(ui(node).container)).lineHeight;
    expect(line(<Typography caption mono natural>a</Typography>)).toBe("16px");
    expect(line(<Typography tiny mono natural>a</Typography>)).toBe("14px");
    expect(line(<Typography small natural>a</Typography>)).toBe("16px");
    expect(line(<Typography tileTitle natural>a</Typography>)).toBe("18px");
    // Without it the role keeps its own line.
    expect(line(<Typography tileTitle>a</Typography>)).toBe("19.5px");
  });

  it("natural sits after relaxedLeading on the leading axis", () => {
    expect(leadingOf({ natural: true })).toBe("natural");
    expect(leadingOf({ relaxedLeading: true, natural: true })).toBe("relaxed");
  });
});

describe("cyan and mint hue tones", () => {
  it("resolve after the status tones and before primary", () => {
    expect(toneOf({ cyan: true, primary: true })).toBe("cyan");
    expect(toneOf({ success: true, mint: true })).toBe("success");
    expect(badgeIntentOf({ cyan: true, mint: true })).toBe("cyan");
  });

  it("paint the solved series ink, which clears 4.5:1 on the page in both schemes", () => {
    const el = first(ui(<Typography caption cyan>a</Typography>).container);
    expect(sameColor(getComputedStyle(el).color, SOLVED_INKS.light.hues.cyan)).toBe(true);
    for (const [scheme, tokens] of [["light", lightColors], ["dark", darkColors]] as const) {
      for (const hue of ["cyan", "mint"] as const) {
        expect(contrastRatio(SOLVED_INKS[scheme].hues[hue], tokens.background as string)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("a Badge mint draws the hue's wash under its solved ink", () => {
    const { container } = ui(<Badge mint>fixed</Badge>);
    expect(painted(container, "color").some((c) => sameColor(c, SOLVED_INKS.light.hues.mint))).toBe(true);
    expect(painted(container, "backgroundColor").some((c) => (channelsOf(c)?.[3] ?? 1) < 1 && (channelsOf(c)?.[3] ?? 0) > 0)).toBe(true);
  });
});

describe("Chip link", () => {
  it("is the last look on its axis", () => {
    expect(chipLookOf({ link: true })).toBe("link");
    expect(chipLookOf({ option: true, link: true })).toBe("option");
  });

  it("is the 26 px pill with 10 px sides and a 500 12/12 label that keeps its look on press", () => {
    expect(chipWeb.link?.base).toMatchObject({ height: 26, gap: 6, borderRadius: 9999 });
    expect(chipWeb.link?.sidePadding.text).toBe(10);
    expect(chipWeb.link?.labelType).toMatchObject({ fontSize: 12, lineHeight: 12, fontWeight: "500" });
    expect(chipWeb.link?.steadyPress).toBe(true);
    // Android's link is its Material 3 assist chip.
    expect(chipAndroid.link).toBeUndefined();
  });

  it("paints the secondary ink on the popover fill", () => {
    const { container } = ui(<Chip link href="/components/switch">Switch</Chip>);
    expect(painted(container, "color").some((c) => sameColor(c, lightColors["muted-foreground"] as string))).toBe(true);
    expect(painted(container, "backgroundColor").some((c) => sameColor(c, lightColors.popover as string))).toBe(true);
  });
});

describe("Card sunken", () => {
  it("sits after flat on the elevation axis", () => {
    expect(elevationOf({ sunken: true })).toBe("sunken");
    expect(elevationOf({ flat: true, sunken: true })).toBe("flat");
    expect(elevationOf({ sunken: true, outlined: true })).toBe("sunken");
  });
});

describe("Kbd compact caps and the flat edge", () => {
  it("resolves small before tiny, and flat on its own axis", () => {
    expect(sizeOf({ small: true, tiny: true })).toBe("small");
    expect(sizeOf({ tiny: true })).toBe("tiny");
    expect(sizeOf({})).toBeNull();
    expect(edgeOf({ flat: true })).toBe("flat");
    expect(edgeOf({})).toBe("raised");
  });

  it("draws the 22 and 20 px caps, the flat one with a one-pixel edge", () => {
    const cap = (node: ReactNode) => getComputedStyle(first(ui(node).container));
    expect(cap(<Kbd small>K</Kbd>).height).toBe("22px");
    expect(cap(<Kbd tiny>K</Kbd>).height).toBe("20px");
    expect(cap(<Kbd small flat>K</Kbd>).borderBottomWidth).toBe("1px");
    expect(cap(<Kbd small>K</Kbd>).borderBottomWidth).toBe("2px");
  });
});

describe("Input shortcut", () => {
  it("shows the shortcut as a keycap inside the field", () => {
    const { container } = ui(<Input placeholder="Search" shortcut="⌘K" accessibilityLabel="Search" />);
    expect(container.textContent).toContain("⌘K");
  });

  it("is absent without the prop", () => {
    const { container } = ui(<Input placeholder="Search" accessibilityLabel="Search" />);
    expect(container.textContent).not.toContain("⌘");
  });
});
