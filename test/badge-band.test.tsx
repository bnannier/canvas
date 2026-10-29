import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, screen } from "@testing-library/react";
import { type ComponentType, type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { colorsFor } from "../src/style/tokens.ts";
import { channelsOf } from "../src/style/color.ts";
import { Badge, type BadgeProps } from "../src/atoms/badge/badge.tsx";
import { Badge as IosBadge } from "../src/atoms/badge/badge.ios.tsx";
import { Badge as AndroidBadge } from "../src/atoms/badge/badge.android.tsx";
import { badgeMetricOf } from "../src/atoms/badge/badge.shared.tsx";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/badge/badge.styles.ts";

// The metrics axis's `band` step: the v4 hand-off's group-band pill, the props table's
// "pick one" beside an axis's title (Component.dc.html line 237: `height:20px;padding:0
// 7px;border-radius:999px;display:inline-flex;align-items:center;background:var(--ion-soft);
// color:var(--ion-tx);font:500 11px var(--fm)`), with no border.

afterEach(cleanup);
const dark = colorsFor("violet", "dark");
const ui = (node: ReactNode) => render(<ThemeProvider dark solid>{node}</ThemeProvider>);

const ENTRIES = [["web", Badge, webSkin], ["ios", IosBadge, iosSkin], ["android", AndroidBadge, androidSkin]] as Array<[string, ComponentType<BadgeProps>, typeof webSkin]>;

describe("Badge metrics axis: band", () => {
  it("sits between tier and small in precedence", () => {
    expect(badgeMetricOf({ band: true })).toBe("band");
    expect(badgeMetricOf({ band: true, small: true })).toBe("band");
    expect(badgeMetricOf({ band: true, tier: true })).toBe("tier");
    expect(badgeMetricOf({ band: true, count: true })).toBe("count");
    expect(badgeMetricOf({ small: true })).toBe("small");
  });

  it("every skin carries the hand-off's band step", () => {
    expect(webSkin.sizes.band).toEqual({ height: 20, paddingHorizontal: 7, fontSize: 11, lineHeight: 14 });
    expect(iosSkin.sizes.band).toEqual(webSkin.sizes.band);
    expect(androidSkin.sizes.band).toEqual(webSkin.sizes.band);
  });
});

for (const [platform, Pill, skin] of ENTRIES) {
  describe(`Badge band (${platform})`, () => {
    it("is a 20 px pill with a 7 px inset, no border, and a 500 11 px label on the accent's soft fill", () => {
      ui(<Pill band mono>pick one</Pill>);
      const label = screen.getByText("pick one");
      const root = label.parentElement!;
      expect(root.style.height).toBe(`${skin.sizes.band.height}px`);
      expect(root.style.paddingLeft).toBe(`${skin.sizes.band.paddingHorizontal}px`);
      expect(root.style.paddingRight).toBe(`${skin.sizes.band.paddingHorizontal}px`);
      expect(root.style.borderWidth).toBe("0px");
      expect(root.style.borderRadius).toBe(`${skin.radius}px`);
      expect(channelsOf(root.style.backgroundColor)).toEqual(channelsOf(dark["primary-soft"]!));
      expect(label.style.fontSize).toBe(`${skin.sizes.band.fontSize}px`);
      expect(label.style.lineHeight).toBe(`${skin.sizes.band.lineHeight}px`);
      expect(label.style.fontWeight).toBe(skin.weight);
    });

    it("takes the tone axis's fill like any pill, and leaves the small pill as it was", () => {
      ui(<Pill band mono secondary>stacks</Pill>);
      expect(channelsOf(screen.getByText("stacks").parentElement!.style.backgroundColor)).toEqual(channelsOf(dark.muted));
      cleanup();
      ui(<Pill small mono>pick one</Pill>);
      const root = screen.getByText("pick one").parentElement!;
      expect(root.style.height).toBe("18px");
      expect(root.style.paddingLeft).toBe("6px");
      expect(root.style.borderWidth).toBe("1px");
    });
  });
}
