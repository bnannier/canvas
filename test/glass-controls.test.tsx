import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Button } from "../src/atoms/button/button.tsx";
import { Button as IosButton } from "../src/atoms/button/button.ios.tsx";
import { Input } from "../src/atoms/input/input.tsx";
import { Switch } from "../src/atoms/switch/switch.tsx";
import { Checkbox } from "../src/atoms/checkbox/checkbox.tsx";
import { Badge } from "../src/atoms/badge/badge.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";
import { Kbd } from "../src/atoms/kbd/kbd.tsx";
import { Alert } from "../src/molecules/alert/alert.tsx";
import { Tabs } from "../src/organisms/tabs/tabs.tsx";
import { selectionTint } from "../src/organisms/tabs/tabs.styles.ts";
import { Pagination } from "../src/atoms/pagination/pagination.tsx";
import { brandInk, brandTint, surfaceUnderFill, BRAND_TINT_ALPHA, BRAND_INK_CONTRAST } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { GLASS_TRACK, GLASS_WASH, legibleInnerFill, legibleTrack, legibleWash } from "../src/style/glass-surface/glass-wash.ts";
import { SELECTED_CARD_TINT } from "../src/style/selected-card.ts";
import { Card } from "../src/molecules/card/card.tsx";
import { Radio, RadioGroup } from "../src/atoms/radio/radio.tsx";
import { Text, View } from "react-native";
import { Icon } from "../src/atoms/icon/icon.tsx";
import { Tabs as IosTabs } from "../src/organisms/tabs/tabs.ios.tsx";
import { Sidebar } from "../src/organisms/sidebar/sidebar.tsx";
import { Sidebar as IosSidebar } from "../src/organisms/sidebar/sidebar.ios.tsx";
import { Navbar } from "../src/organisms/navbars/navbars.tsx";
import { TabBar } from "../src/organisms/tab-bar/tab-bar.tsx";
import { TabBar as IosTabBar } from "../src/organisms/tab-bar/tab-bar.ios.tsx";
import { alpha, channelsOf, composite, contrastRatio } from "../src/style/color.ts";
import { actionFill, actionInk } from "../src/style/action.ts";
import { frameBedsFor, lightColors, palette } from "../src/style/tokens.ts";
import { WEB_TINTS } from "../src/style/glass-surface/web-frost.ts";
import { statusColors } from "../src/style/status.ts";
import { HUE_SOFT } from "../src/atoms/chip/chip.shared.tsx";
import { LOOKS, lookProps } from "./fixtures/looks.ts";
import { shellBeds } from "./fixtures/page-look.ts";
import { createRadio } from "../src/atoms/radio/radio.shared.tsx";
import { webSkin as webRadioSkin, androidSkin as androidRadioSkin } from "../src/atoms/radio/radio.styles.ts";
import { Checkbox as AndroidCheckbox } from "../src/atoms/checkbox/checkbox.android.tsx";
import { createSwitch } from "../src/atoms/switch/switch.shared.tsx";
import { paneStyle } from "../src/style/glass-surface/glass-pane.tsx";
import { StyleSheet } from "react-native";
import { webSkin as webSwitchSkin, iosSkin as iosSwitchSkin } from "../src/atoms/switch/switch.styles.ts";
import { webSkin as webCheckboxSkin, androidSkin as androidCheckboxSkin } from "../src/atoms/checkbox/checkbox.styles.ts";

// The CONTROL layer of the glass model: every control that paints a surface of its
// own (a field box, a button, a switch track, a checkbox, a badge, a chip, a keycap,
// a tab pill, a page cell) renders it through the material under glass, as a
// GlassPane behind the node that keeps the control's own semantics and interaction.
// In solid mode the pane renders nothing and the control keeps its opaque fill.
//
// Two rules the pucks follow, pinned here:
//   - A BRAND fill (a primary or destructive button, a checked switch, a selected tab
//     or page) is brand-tinted glass: the brand colour is the under-fill, as sheer as
//     legibility allows, with the brand's own ink on top at 4.5:1 over the page.
//   - A HUE wash (a status badge, a coloured chip) is the hue's mid step under the
//     material with the label stepped one deeper than the solid recipe, so every hue
//     holds 4.5:1 over the page, over a content pane and over a control puck.
//
// The material only renders on a material path, and with the expo peers stubbed the one
// reachable here is the web frost, which renders wherever the browser supports a CSS
// backdrop-filter (the test DOM's CSS.supports says it does).

afterEach(cleanup);

async function renderGlass(ui: React.ReactElement, solid = false) {
  const result = render(<ThemeProvider glass={!solid} solid={solid}>{ui}</ThemeProvider>);
  if (!solid) await waitFor(() => expect(materialLayers(result.container)).toBeGreaterThan(0));
  return result;
}

// The material is the wrapper GlassBox paints behind the content. Counting wrappers, not
// backdrop-filtered layers, finds the clear surfaces too: a text field draws no frost.
const materialLayers = (root: HTMLElement) => root.querySelectorAll('[data-testid="glass-material"]').length;
// Inside the wrapper the fill is the layer that paints a background: BEFORE the frost
// for a layer tint (the material's body), AFTER it for a brand colour, which composites
// over the material so the colour the ink solver saw is the colour that renders (the rim
// that follows paints a box shadow, never a background).
const fillOfMaterial = (material: Element | null): { fill: HTMLElement | null; over: boolean } => {
  const layers = Array.from(material?.children ?? []) as HTMLElement[];
  const frost = layers.findIndex((layer) => layer.style.backdropFilter);
  const fill = layers.findIndex((layer) => layer.style.backgroundColor);
  return fill < 0 ? { fill: null, over: false } : { fill: layers[fill], over: frost >= 0 && fill > frost };
};
const fillLayerOf = (root: HTMLElement) => fillOfMaterial(root.querySelector('[data-testid="glass-material"]'));
const underFillOf = (root: HTMLElement): string => fillLayerOf(root).fill?.style.backgroundColor ?? "";
// react-native-web stores an alpha as an 8-bit channel and prints it with two decimals,
// and a hex alpha() string prints a bare one, so colours compare as numbers quantized
// the way react-native-web does it, not as strings.
const rgbaOf = (value: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(value);
  if (!m) return value;
  const a = m[4] == null ? 1 : Number(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number((Math.round(a * 255) / 255).toFixed(2))];
};

// The web renders the web frost's own tints (web-frost.ts); `glassByScheme` is the
// native set (iOS, Android).
const LIGHT = WEB_TINTS.light;

describe("brand-tinted glass pucks", () => {
  it("a primary Button is a brand puck: the container fill goes transparent and the action colour is the under-fill", async () => {
    const { container } = await renderGlass(<Button primary testID="save">Save</Button>);
    const button = container.querySelector('[data-testid="save"]') as HTMLElement;
    expect(button.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    expect(materialLayers(button)).toBe(1);
    expect(rgbaOf(underFillOf(button))).toEqual(rgbaOf(brandTint(actionFill(lightColors), lightColors.background, actionInk(lightColors))));
  });

  it("a destructive Button carries the destructive colour; ghost and link buttons take no material at all", async () => {
    const { container } = await renderGlass(
      <>
        <Button destructive testID="delete">Delete</Button>
        <Button ghost testID="ghost">Cancel</Button>
        <Button link testID="link">Learn more</Button>
      </>,
    );
    const del = container.querySelector('[data-testid="delete"]') as HTMLElement;
    expect(rgbaOf(underFillOf(del))).toEqual(rgbaOf(brandTint(lightColors.destructive, lightColors.background)));
    expect(materialLayers(container.querySelector('[data-testid="ghost"]') as HTMLElement)).toBe(0);
    expect(materialLayers(container.querySelector('[data-testid="link"]') as HTMLElement)).toBe(0);
  });

  it("the web's outline and secondary Buttons paint no surface, so they stay bare with their borders", async () => {
    // Dark Factory's outline looks are transparent pills: a hairline (`outline`) or the
    // violet ring (`secondary`) around the label, no fill for the material to replace.
    const { container } = await renderGlass(
      <>
        <Button primary testID="anchor">Save</Button>
        <Button outline testID="more">More</Button>
        <Button secondary testID="review">Review</Button>
      </>,
    );
    const more = container.querySelector('[data-testid="more"]') as HTMLElement;
    const review = container.querySelector('[data-testid="review"]') as HTMLElement;
    expect(materialLayers(more)).toBe(0);
    expect(materialLayers(review)).toBe(0);
    expect(rgbaOf(more.style.borderColor)).toEqual(rgbaOf(alpha(lightColors.border, 1)));
    expect(rgbaOf(review.style.borderColor)).toEqual(rgbaOf(alpha(lightColors.ring, 1)));
  });

  it("a surfaced outline Button (iOS) is a plain control puck with its hairline dropped (the rim is the edge)", async () => {
    const { container } = await renderGlass(<IosButton outline testID="more">More</IosButton>);
    const button = container.querySelector('[data-testid="more"]') as HTMLElement;
    expect(rgbaOf(underFillOf(button))).toEqual(rgbaOf(LIGHT["glass-tint-control"]));
    expect(button.style.borderColor).toBe("rgba(0, 0, 0, 0.00)");
  });

  it("a checked Switch track is brand glass and an unchecked one its off-track fill (GS-1)", async () => {
    const { container } = await renderGlass(
      <>
        <Switch defaultChecked testID="on" accessibilityLabel="Notifications" />
        <Switch testID="off" accessibilityLabel="Marketing" />
      </>,
    );
    const on = container.querySelector('[data-testid="on"]') as HTMLElement;
    const off = container.querySelector('[data-testid="off"]') as HTMLElement;
    expect(rgbaOf(underFillOf(on))).toEqual(rgbaOf(brandTint(lightColors.primary, lightColors.background)));
    const offTrack = legibleTrack({ tokens: lightColors, glass: LIGHT }, lightColors.input, lightColors.background);
    expect(rgbaOf(underFillOf(off))).toEqual(rgbaOf(offTrack.startsWith("#") ? alpha(offTrack, 1) : offTrack));
    // The off track and its thumb are the control's boundary: their fills paint OVER the
    // frost, where the blur cannot pull the page into them (as a brand fill does), and the
    // checked thumb keeps its tint beneath the frost as before.
    const materials = (root: HTMLElement) => Array.from(root.querySelectorAll('[data-testid="glass-material"]'));
    const [offTrackMaterial, offThumbMaterial] = materials(off);
    expect(fillOfMaterial(offTrackMaterial!).over).toBe(true);
    expect(fillOfMaterial(offThumbMaterial!).over).toBe(true);
    expect(rgbaOf(fillOfMaterial(offThumbMaterial!).fill!.style.backgroundColor)).toEqual(rgbaOf(alpha(lightColors.background, 1)));
    expect(fillOfMaterial(materials(on)[1]!).over).toBe(false);
  });

  it("a checked Checkbox box is brand glass with the check on top", async () => {
    const { container } = await renderGlass(<Checkbox defaultChecked testID="terms">Accept</Checkbox>);
    const row = container.querySelector('[data-testid="terms"]') as HTMLElement;
    expect(rgbaOf(underFillOf(row))).toEqual(rgbaOf(brandTint(lightColors.primary, lightColors.background)));
    expect(row.textContent).toContain("✓");
  });

  it("the selected Tabs material uses its skin tint and stable foreground over a functional-layer track", async () => {
    const { container } = await renderGlass(<Tabs pills tabs={["Overview", "Activity"]} testID="tabs" />);
    const strip = container.querySelector('[data-testid="tabs"]') as HTMLElement;
    // The track's own pane is the first material; the selected tab's puck follows.
    const fills = Array.from(strip.querySelectorAll('[data-testid="glass-material"]')).map((material) => rgbaOf(fillOfMaterial(material).fill?.style.backgroundColor ?? ""));
    expect(fills[0]).toEqual(rgbaOf(LIGHT["glass-tint"]));
    // The web shares the capsule segmented control with iOS: the puck carries the
    // raised thumb's fill (the light scheme's `background`) at the selection tint's
    // opacity ceiling, not a brand tint.
    expect(fills).toContainEqual(rgbaOf(selectionTint({ backgroundColor: lightColors.background }, false)!));
    const selected = strip.querySelector('[aria-selected="true"]') as HTMLElement;
    const label = Array.from(selected.querySelectorAll("*")).find((n) => n.textContent === "Overview" && (n as HTMLElement).style.color) as HTMLElement;
    expect(rgbaOf(label.style.color)).toEqual(rgbaOf(alpha(lightColors.foreground, 1)));
  });

  it("the current page of a Pagination is a brand puck; its bare pages and hairline arrows take no material", async () => {
    const { container } = await renderGlass(<Pagination total={3} defaultPage={2} testID="pages" />);
    const pages = container.querySelector('[data-testid="pages"]') as HTMLElement;
    const current = pages.querySelector('[aria-current="page"]') as HTMLElement;
    expect(rgbaOf(underFillOf(current))).toEqual(rgbaOf(brandTint(lightColors.primary, lightColors.background)));
    // Dark Factory's pager paints no surface but the current page: the other pages are bare
    // numbers and the arrows transparent outline circles, like the web's outline Button.
    expect(materialLayers(pages)).toBe(1);
    const previous = pages.querySelector('[aria-label="Previous page"]') as HTMLElement;
    expect(materialLayers(previous)).toBe(0);
    expect(previous.style.borderTopWidth).toBe("1px");
    expect(rgbaOf(previous.style.borderTopColor)).toEqual(rgbaOf(alpha(lightColors.border, 1)));
  });

  it("paints a brand fill OVER the material and a layer tint beneath it", async () => {
    // The solver models the puck as the brand composited on the page. Beneath the
    // material that model failed: the frost's own scheme tint dyed the fill (expo-blur's
    // dark BlurView halved the brand's brightness on iOS, 2:1 for the ink) and the blur
    // pulled the dark surroundings into a small puck (3.4:1 on the web Calendar day).
    // Over the material the brand composites on the blurred page, as solved.
    const { container } = await renderGlass(
      <>
        <Button primary testID="brand">Save</Button>
        <IosButton outline testID="plain">More</IosButton>
      </>,
    );
    const brand = fillLayerOf(container.querySelector('[data-testid="brand"]') as HTMLElement);
    expect(brand.over).toBe(true);
    expect(rgbaOf(brand.fill!.style.backgroundColor)).toEqual(rgbaOf(brandTint(actionFill(lightColors), lightColors.background, actionInk(lightColors))));
    const plain = fillLayerOf(container.querySelector('[data-testid="plain"]') as HTMLElement);
    expect(plain.over).toBe(false);
    expect(rgbaOf(plain.fill!.style.backgroundColor)).toEqual(rgbaOf(LIGHT["glass-tint-control"]));
  });

  it("keeps the painted ink at 4.5:1 over the page in every palette, densifying only as far as it needs", () => {
    for (const { name: scheme, tokens: t, nativeGlass } of LOOKS) {
      for (const brand of [t.primary, actionFill(t), t.destructive]) {
        // The ink is the one the skin paints on the brand (its token pair), not the stronger
        // of black and white (see brandInk).
        const ink = brandInk(t, brand);
        const fill = surfaceUnderFill(nativeGlass, "control", brand, undefined, t);
        expect(fill).toBe(brandTint(brand, t.background, ink));
        expect(contrastRatio(composite(fill, t.background), ink), `${scheme} ${brand}`).toBeGreaterThanOrEqual(BRAND_INK_CONTRAST);
        // Never sheerer than the floor; where the floor already clears, it stays there.
        const floor = alpha(brand, BRAND_TINT_ALPHA);
        if (contrastRatio(composite(floor, t.background), ink) >= BRAND_INK_CONTRAST) expect(fill).toBe(floor);
      }
    }
  });
});

describe("hue washes", () => {
  it("a coloured Chip washes the material with the hue's mid step at the soft alpha under its deep label; a status Badge is the plain control material with its tone on the dot", async () => {
    const { container } = await renderGlass(
      <>
        <Badge status success testID="status">Active</Badge>
        <Badge destructive testID="soft">Blocked</Badge>
        <Chip blue testID="chip">Design</Chip>
        <Kbd testID="kbd">⌘</Kbd>
      </>,
    );
    // Dark Factory's live-state pill: the quiet surface pill, the foreground label, the tone's dot.
    const badge = container.querySelector('[data-testid="status"]') as HTMLElement;
    expect(rgbaOf(underFillOf(badge))).toEqual(rgbaOf(LIGHT["glass-tint-control"]));
    expect(badge.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    const badgeLabel = Array.from(badge.querySelectorAll("*")).find((n) => n.textContent === "Active" && (n as HTMLElement).style.color) as HTMLElement;
    expect(rgbaOf(badgeLabel.style.color)).toEqual(rgbaOf(alpha(lightColors.foreground, 1)));
    expect(rgbaOf((badgeLabel.previousElementSibling as HTMLElement).style.backgroundColor)).toEqual(rgbaOf(alpha(statusColors(lightColors, "success").dot, 1)));
    // The soft destructive pill washes the material with its own wash, under its ink.
    const soft = container.querySelector('[data-testid="soft"]') as HTMLElement;
    expect(rgbaOf(underFillOf(soft))).toEqual(rgbaOf(statusColors(lightColors, "error").wash));
    const chip = container.querySelector('[data-testid="chip"]') as HTMLElement;
    expect(rgbaOf(underFillOf(chip))).toEqual(rgbaOf(alpha(palette["blue-500"], HUE_SOFT.light)));
    const chipLabel = Array.from(chip.querySelectorAll("*")).find((n) => n.textContent === "Design" && (n as HTMLElement).style.color) as HTMLElement;
    expect(rgbaOf(chipLabel.style.color)).toEqual(rgbaOf(alpha(palette["blue-800"], 1)));
    // A keycap is the plain control material.
    expect(rgbaOf(underFillOf(container.querySelector('[data-testid="kbd"]') as HTMLElement))).toEqual(rgbaOf(LIGHT["glass-tint-control"]));
  });

  it("holds every hue's deeper label at 4.5:1 over its chip wash on the page, a content pane and a control puck, in every palette", () => {
    const hues = Object.keys(palette).filter((k) => k.endsWith("-500")).map((k) => k.slice(0, -4));
    expect(hues.length).toBeGreaterThan(10);
    // The panes differ by platform: the web frost's tints and the native set.
    for (const look of LOOKS) {
      for (const [platform, g] of [["web", look.webGlass], ["native", look.nativeGlass]] as const) {
        const { name: scheme, tokens: t } = look;
        const dark = look.scheme === "dark";
        const bases = [t.background, composite(g["glass-tint-content"], t.background), composite(g["glass-tint-control"], composite(g["glass-tint-content"], t.background))];
        for (const hue of hues) {
          const wash = alpha(palette[`${hue}-500`], dark ? HUE_SOFT.dark : HUE_SOFT.light);
          const ink = palette[`${hue}-${dark ? 300 : 800}`];
          for (const base of bases) {
            expect(contrastRatio(composite(wash, base), ink), `${platform} ${scheme} ${hue} over ${base}`).toBeGreaterThanOrEqual(4.5);
          }
        }
      }
    }
  });

  it("paints a toned pane's wash IN PLACE of the layer's tint, so its ink reads as it does over the page", async () => {
    // A pane's tint replaces the layer's under-fill (surfaceUnderFill): the soft Badge's
    // control puck and the toned Alert's content pane are the wash alone over the material.
    // Composited over the control puck instead, the lighter dark-mode inks would fall under
    // 4.5:1 on the native frost (success about 3.96:1), which is why the wash never stacks on it.
    const { container } = await renderGlass(
      <>
        <Badge destructive testID="soft">Blocked</Badge>
        <Alert success title="Saved" description="Every change is stored." testID="alert" />
      </>,
    );
    expect(rgbaOf(underFillOf(container.querySelector('[data-testid="soft"]') as HTMLElement))).toEqual(rgbaOf(statusColors(lightColors, "error").wash));
    expect(rgbaOf(underFillOf(container.querySelector('[data-testid="alert"]') as HTMLElement))).toEqual(rgbaOf(statusColors(lightColors, "success").wash));
    for (const look of LOOKS) {
      const t = look.tokens;
      for (const tone of ["success", "warning", "error", "info"] as const) {
        const { ink, wash } = statusColors(t, tone);
        const bed = composite(wash, t.background);
        expect(contrastRatio(bed, ink), `${look.name} ${tone} ink`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(bed, t.foreground), `${look.name} ${tone} Alert body`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("the solid recipe's 700/400 label is what the deeper step replaces (it dips under 4.5:1 on the wash)", () => {
    const wash = alpha(palette["orange-500"], HUE_SOFT.light);
    expect(contrastRatio(composite(wash, lightColors.background), palette["orange-700"])).toBeLessThan(4.5);
    expect(contrastRatio(composite(wash, lightColors.background), palette["orange-800"])).toBeGreaterThanOrEqual(4.5);
  });
});

describe("field boxes", () => {
  it("an Input box drops its fill and resting hairline for the pane, and an errored box keeps its destructive border over a legible destructive wash", async () => {
    const { container } = await renderGlass(
      <>
        <Input label="Name" testID="name" />
        <Input label="Email" error testID="email" />
      </>,
    );
    const name = container.querySelector('[data-testid="name"]') as HTMLElement;
    expect(name.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    expect(name.style.borderColor).toBe("rgba(0, 0, 0, 0.00)");
    expect(rgbaOf(underFillOf(name.parentElement as HTMLElement))).toEqual(rgbaOf(alpha(lightColors.card, 0.22)));
    const email = container.querySelector('[data-testid="email"]') as HTMLElement;
    expect(rgbaOf(email.style.borderColor)).toEqual(rgbaOf(alpha(lightColors.destructive, 1)));
    // The web field is a clear well: the wash lies over its veil, capped for its ink.
    const wash = legibleWash({ tokens: lightColors, glass: LIGHT, dark: false }, "error", { clear: true, layer: "control" });
    expect(rgbaOf(underFillOf(email.parentElement as HTMLElement))).toEqual(rgbaOf(wash));
    expect(contrastRatio(composite(wash, lightColors.background), lightColors["muted-foreground"])).toBeGreaterThanOrEqual(4.5);
  });
});

describe("state washes", () => {
  // A field's error wash and a selected card's wash carry the solid recipe's own inks, the
  // muted placeholder, prefix and description and the foreground value or title. Each is
  // capped where those inks would fall under 4.5:1 (legibleWash, the owner's GP-2 decision),
  // over the page and over a content pane, in every look and on the web's and the native
  // tints, for every pane a wash lies in: the web's clear field, a control puck, a card.
  const panes = [
    { name: "clear field", pane: { clear: true, layer: "control" as const }, web: true },
    { name: "control puck", pane: { layer: "control" as const }, web: false },
    { name: "content pane", pane: { layer: "content" as const }, web: false },
  ];
  it("holds the muted and foreground inks at 4.5:1 on the error and selection washes, and on the inner fill over the error wash", () => {
    for (const look of LOOKS) {
      const t = look.tokens;
      const dark = look.scheme === "dark";
      for (const [platform, g] of [["web", look.webGlass], ["native", look.nativeGlass]] as const) {
        const bases = [t.background, composite(g["glass-tint-content"], t.background)];
        for (const { name, pane, web } of panes) {
          if (web && platform !== "web") continue;
          // A field's addon and PhoneInput's country segment paint the soft inner fill over the
          // error wash, under the same muted ink: on the web host capped for that ink
          // (legibleInnerFill, GS-2), on a native host at the soft strength.
          const addon = platform === "web" ? legibleInnerFill({ tokens: t, glass: g, dark }, pane, "soft") : alpha(t.foreground, dark ? 0.09 : 0.06);
          const body = pane.clear ? alpha(t.card, dark ? 0.28 : 0.22) : surfaceUnderFill(g, pane.layer);
          for (const wash of ["error", "selection"] as const) {
            const beds = (fill: string) => bases.flatMap((base) => wash === "error" ? [composite(fill, base), composite(addon, composite(fill, base))] : [composite(fill, base)]);
            const holds = (fill: string) => beds(fill).every((bed) => [t["muted-foreground"], t.foreground].every((ink) => contrastRatio(bed, ink) >= 4.5));
            const fill = legibleWash({ tokens: t, glass: g, dark }, wash, pane);
            const where = `${platform} ${look.name} ${name} ${wash}`;
            if (!holds(body)) {
              // Where the body alone misses the floor a wash would only deepen the miss, so the
              // pane keeps its body. That is never the web host since the addon is capped for
              // its ink (GS-2): only the native host, whose tints put the dark control puck's
              // muted ink at 4.20:1 (3.33 with the addon) where the iOS device's frost, which
              // paints a body the tints do not predict, measures 4.76 with the addon (GP-11).
              expect(platform, `${where}: the web host never misses the ink floor`).toBe("native");
              expect(fill, where).toBe(body);
              continue;
            }
            for (const bed of beds(fill)) {
              expect(contrastRatio(bed, t["muted-foreground"]), `${where} muted on ${bed}`).toBeGreaterThanOrEqual(4.5);
              expect(contrastRatio(bed, t.foreground), `${where} foreground on ${bed}`).toBeGreaterThanOrEqual(4.5);
            }
          }
        }
      }
    }
    // The selection wash misses only where its body does: the dark native control puck.
    const missed = LOOKS.flatMap((look) => ([["web", look.webGlass], ["native", look.nativeGlass]] as const).flatMap(([platform, g]) => panes
      .filter(({ web }) => !web || platform === "web")
      .filter(({ pane }) => {
        const t = look.tokens;
        const body = pane.clear ? alpha(t.card, look.scheme === "dark" ? 0.28 : 0.22) : surfaceUnderFill(g, pane.layer);
        return legibleWash({ tokens: t, glass: g, dark: look.scheme === "dark" }, "selection", pane) === body;
      })
      .map(({ name }) => `${platform} ${look.name} ${name}`)));
    expect(missed).toEqual(["native dark control puck"]);
  });

  it("lays the selection wash at the solid recipe's own tint in every look, its inks still at 4.5:1", () => {
    // The owner's GP-2b decision: a selected card reads as in solid in every look, the dark
    // one included, so the wash's ceiling is solid's selected tint, read from the recipe, and
    // on a card's content pane it is never capped below it: the card paints solid's tint over
    // its own body, on the web's tints and the native ones.
    expect(GLASS_WASH.selection.ceiling).toBe(SELECTED_CARD_TINT);
    const within = (a: string, b: string) => {
      const [x, y] = [rgbaOf(a), rgbaOf(b)] as number[][];
      return x!.slice(0, 3).every((c, i) => Math.abs(c - y![i]!) <= 1);
    };
    for (const look of LOOKS) {
      const t = look.tokens;
      for (const [platform, g] of [["web", look.webGlass], ["native", look.nativeGlass]] as const) {
        const fill = legibleWash({ tokens: t, glass: g, dark: look.scheme === "dark" }, "selection", { layer: "content" });
        const body = surfaceUnderFill(g, "content");
        for (const base of [t.background, composite(g["glass-tint-content"], t.background)]) {
          const where = `${platform} ${look.name} over ${base}`;
          const solidTint = composite(alpha(t.primary, SELECTED_CARD_TINT), composite(body, base));
          expect(within(composite(fill, base), solidTint), `${where}: ${composite(fill, base)} against ${solidTint}`).toBe(true);
          expect(contrastRatio(composite(fill, base), t["muted-foreground"]), `${where} muted`).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(composite(fill, base), t.foreground), `${where} foreground`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("the selection tints (a tab, a sidebar row, a navbar link, a tab-bar cell) keep their label at 4.5:1 over the page", async () => {
    // Not a capped wash: each keeps its skin's hue at selectionTint's translucent ceiling,
    // and its label clears the floor in every look (measured as rendered).
    const items = [{ key: "home", label: "Home", icon: () => <Icon home size={22} /> }, { key: "search", label: "Search", icon: () => <Icon search size={22} /> }];
    const hosts = [
      <Tabs pills tabs={["General", "Security"]} />,
      <IosTabs tabs={["General", "Security"]} />,
      <Sidebar defaultActive="Dashboard" items={[{ label: "Dashboard" }, { label: "Inbox" }]} />,
      <IosSidebar defaultActive="Dashboard" items={[{ label: "Dashboard" }, { label: "Inbox" }]} />,
      <Navbar brand="Canvas" links={["Dashboard", "Users"]} />,
      <TabBar items={items} />,
      <IosTabBar items={items} />,
    ];
    for (const look of LOOKS) {
      for (const node of hosts) {
        const { container, unmount } = render(<ThemeProvider scheme={look.scheme} mint={look.palette === "mint"} glass>{node}</ThemeProvider>);
        await waitFor(() => expect(materialLayers(container)).toBeGreaterThan(0));
        const panes = Array.from(container.querySelectorAll("*")).filter((n) => (n as HTMLElement).style.zIndex === "-1" && n.querySelector(':scope > [data-testid="glass-material"]')) as HTMLElement[];
        for (const pane of panes) {
          const fill = fillOfMaterial(pane.querySelector(':scope > [data-testid="glass-material"]')).fill?.style.backgroundColor;
          if (!fill) continue;
          const labels = Array.from(pane.parentElement!.querySelectorAll("*")).filter((n) => (n as HTMLElement).style.color && n.children.length === 0 && n.textContent) as HTMLElement[];
          for (const label of labels) {
            expect(contrastRatio(composite(fill, look.tokens.background), label.style.color), `${look.name} ${label.textContent}`).toBeGreaterThanOrEqual(4.5);
          }
        }
        unmount();
      }
    }
  });

  it("a selected Card and a checked Radio card keep their primary border over the capped selection wash", async () => {
    const { container } = await renderGlass(
      <>
        <Card selected onPress={() => {}} testID="card"><Text>Pro</Text></Card>
        <RadioGroup defaultValue="pro" label="Plan"><Radio value="pro" card description="For growing teams.">Pro</Radio></RadioGroup>
      </>,
    );
    const wash = legibleWash({ tokens: lightColors, glass: LIGHT, dark: false }, "selection", { layer: "content" });
    const card = container.querySelector('[data-testid="card"]') as HTMLElement;
    const radio = container.querySelector('[role="radio"]') as HTMLElement;
    for (const host of [card, radio]) {
      expect(rgbaOf(host.style.borderColor || host.style.borderTopColor)).toEqual(rgbaOf(alpha(lightColors.primary, 1)));
      expect(host.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
      expect(rgbaOf(underFillOf(host))).toEqual(rgbaOf(wash));
    }
  });

  it("paints the same selected tint in solid, the one the glass wash reads", async () => {
    const { container } = await renderGlass(
      <>
        <Card selected onPress={() => {}} testID="card"><Text>Pro</Text></Card>
        <RadioGroup defaultValue="pro" label="Plan"><Radio value="pro" card description="For growing teams.">Pro</Radio></RadioGroup>
      </>,
      true,
    );
    const card = container.querySelector('[data-testid="card"]') as HTMLElement;
    const radio = container.querySelector('[role="radio"]') as HTMLElement;
    for (const host of [card, radio]) {
      expect(rgbaOf(host.style.borderColor || host.style.borderTopColor)).toEqual(rgbaOf(alpha(lightColors.primary, 1)));
      expect(rgbaOf(host.style.backgroundColor)).toEqual(rgbaOf(alpha(lightColors.primary, SELECTED_CARD_TINT)));
    }
  });
});

describe("solid mode", () => {
  it("renders no material anywhere and keeps the opaque fills", async () => {
    const { container } = await renderGlass(
      <>
        <Button primary testID="save">Save</Button>
        <Input label="Name" testID="name" />
        <Switch defaultChecked testID="on" accessibilityLabel="Notifications" />
        <Badge status success>Active</Badge>
        <Chip blue>Design</Chip>
        <Kbd>⌘</Kbd>
        <Tabs pills tabs={["Overview", "Activity"]} />
        <Pagination total={3} />
      </>,
      true,
    );
    expect(materialLayers(container)).toBe(0);
    expect(rgbaOf((container.querySelector('[data-testid="save"]') as HTMLElement).style.backgroundColor)).toEqual(rgbaOf(alpha(actionFill(lightColors), 1)));
    expect(rgbaOf((container.querySelector('[data-testid="name"]') as HTMLElement).style.backgroundColor)).toEqual(rgbaOf(alpha(lightColors.card, 1)));
  });

  it("solves a brand puck over the docs' frame too, so its ink clears 4.5:1 on every bed of it", () => {
    // The frame: Dark Factory's shell frost over its page look (docs/src/shell/page-look.ts),
    // which the kit carries as frameBeds; the fixture derives the same beds from the docs.
    for (const look of LOOKS) {
      const t = look.tokens;
      const beds = frameBedsFor(look.palette, look.scheme);
      expect(beds.map((bed) => channelsOf(bed)!.slice(0, 3))).toEqual(shellBeds(look.name).map((bed) => channelsOf(bed)!.slice(0, 3)));
      for (const glass of [look.webGlass, look.nativeGlass]) {
        const fill = surfaceUnderFill(glass, "control", t.primary, undefined, t, beds);
        for (const bed of [t.background, ...beds]) {
          expect(contrastRatio(composite(fill, bed), brandInk(t, t.primary)), `${look.name} primary over ${bed}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});

// The owner's GS-1 decision (audit/DECISIONS.md): under glass a resting control whose
// boundary identifies it keeps that boundary at the 3:1 WCAG 1.4.11 asks. An unchecked
// Radio ring and an unchecked Checkbox box keep their border over the pane in its solid
// colour (`input` on the web, `muted-foreground` on Android), the pane flush inside it; an
// off Switch keeps its off-track fill as the pane's under-fill (`legibleTrack`), the sheerest
// alpha at which the track keeps 3:1 against the page or pane around it and under its thumb.
// The rim alone measured about 1.2:1 in the light palettes and 1.4:1 in dark.
describe("a selection control keeps its identifying boundary under glass (GS-1)", () => {
  const contrast = (a: string, b: string) => contrastRatio(a, b);

  it("holds the kept ring and box at 3:1 against the page and a content pane around them, in every look", () => {
    for (const l of LOOKS) {
      const t = l.tokens;
      const rings = [
        [webRadioSkin.mark.kind === "ring" ? webRadioSkin.mark.ring(t, "base", false, true).borderColor : t.input, l.webGlass, "web radio"],
        [androidRadioSkin.mark.kind === "ring" ? androidRadioSkin.mark.ring(t, "base", false, true).borderColor : t["muted-foreground"], l.nativeGlass, "android radio"],
        [webCheckboxSkin.box(t, false, "base", false).borderColor, l.webGlass, "web checkbox"],
        [androidCheckboxSkin.box(t, false, "base", false).borderColor, l.nativeGlass, "android checkbox"],
      ] as const;
      for (const [ring, glass, name] of rings) {
        const page = t.background;
        const pane = composite(glass["glass-tint-content"], page);
        for (const ground of [page, pane]) {
          expect(contrast(String(ring), ground), `${l.name} ${name} ring on its ground`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it("solves the web off track at 3:1 against the page and a content pane, and the thumb at 3:1 on it, in every look", () => {
    for (const l of LOOKS) {
      const t = l.tokens;
      const track = webSwitchSkin.track(t, l.scheme === "dark", false, "base");
      const thumb = String(webSwitchSkin.thumb(t, false, "base").backgroundColor);
      const under = legibleTrack({ tokens: t, glass: l.webGlass }, String(track.backgroundColor), thumb);
      for (const ground of [t.background, composite(l.webGlass["glass-tint-content"], t.background)]) {
        const painted = composite(under, ground);
        expect(contrast(painted, ground), `${l.name} track on its ground`).toBeGreaterThanOrEqual(GLASS_TRACK.boundaryContrast);
        expect(contrast(painted, thumb), `${l.name} thumb on the track`).toBeGreaterThanOrEqual(GLASS_TRACK.boundaryContrast);
      }
    }
  });

  it("gives the iOS off track solid's systemGray3 under glass (Apple keeps it under 3:1; no floor is asserted)", () => {
    for (const l of LOOKS) {
      const dark = l.scheme === "dark";
      const track = String(iosSwitchSkin.track(l.tokens, dark, false, "base").backgroundColor);
      const thumb = String(iosSwitchSkin.thumb(l.tokens, false, "base").backgroundColor);
      expect(track).toBe(dark ? "#48484a" : "#c7c7cc");
      expect(legibleTrack({ tokens: l.tokens, glass: l.nativeGlass }, track, thumb)).toBe(track);
    }
  });

  for (const l of LOOKS) {
    it(`renders the kept boundary in ${l.name}: the unchecked ring and box keep their border colour with the pane inside, the checked ones trade it for padding`, async () => {
      const WebRadio = createRadio(webRadioSkin);
      const { container } = render(
        <ThemeProvider glass {...lookProps(l)}>
          <WebRadio testID="off">Hobby</WebRadio>
          <WebRadio testID="on" checked>Pro</WebRadio>
          <Checkbox testID="box-off">Email</Checkbox>
          <Checkbox testID="box-on" defaultChecked>SMS</Checkbox>
        </ThemeProvider>,
      );
      await waitFor(() => expect(materialLayers(container)).toBeGreaterThan(0));
      const t = l.tokens;
      const hostOf = (id: string) => {
        const pane = (container.querySelector(`[data-testid="${id}"]`) as HTMLElement).querySelector('[data-testid="glass-material"]')!.parentElement!;
        return { host: pane.parentElement as HTMLElement, pane: pane as HTMLElement };
      };
      const ring = hostOf("off");
      expect(ring.host.style.borderWidth || ring.host.style.borderTopWidth).toBe("2px");
      expect(rgbaOf(ring.host.style.borderColor || ring.host.style.borderTopColor)).toEqual(rgbaOf(alpha(t.input, 1)));
      const ringRadius = Number.parseFloat(String(webRadioSkin.mark.kind === "ring" ? webRadioSkin.mark.ring(t, "base", false, true).borderRadius : 0));
      expect(Number.parseFloat(ring.pane.style.borderTopLeftRadius || ring.pane.style.borderRadius)).toBe(Math.max(0, ringRadius - 2));
      const checked = hostOf("on");
      expect(checked.host.style.borderWidth || "0px").toBe("0px");
      const box = hostOf("box-off");
      expect(box.host.style.borderWidth || box.host.style.borderTopWidth).toBe("1px");
      expect(rgbaOf(box.host.style.borderColor || box.host.style.borderTopColor)).toEqual(rgbaOf(alpha(t.input, 1)));
      const filled = hostOf("box-on");
      expect(filled.host.style.borderWidth || "0px").toBe("0px");
    });
  }

  it("keeps the Android ring and box in muted-foreground over the pane", async () => {
    const AndroidRadio = createRadio(androidRadioSkin);
    const { container } = render(
      <ThemeProvider glass light>
        <AndroidRadio testID="off">Hobby</AndroidRadio>
        <AndroidCheckbox selection testID="box-off">Email</AndroidCheckbox>
      </ThemeProvider>,
    );
    await waitFor(() => expect(materialLayers(container)).toBeGreaterThan(0));
    for (const id of ["off", "box-off"]) {
      const host = (container.querySelector(`[data-testid="${id}"]`) as HTMLElement).querySelector('[data-testid="glass-material"]')!.parentElement!.parentElement as HTMLElement;
      expect(host.style.borderWidth || host.style.borderTopWidth, id).toBe("2px");
      expect(rgbaOf(host.style.borderColor || host.style.borderTopColor), id).toEqual(rgbaOf(alpha(lightColors["muted-foreground"], 1)));
    }
  });

  it("reads a kept boundary as a resting border under Increase Contrast: it takes the contrasting border, where a state border keeps its colour", () => {
    const contrastTheme = { surface: "solid", increasedContrast: true, reducedTransparency: false, tokens: lightColors } as Parameters<typeof paneStyle>[0];
    const ring = { borderRadius: 9999, borderWidth: 2, borderColor: lightColors.input };
    const flat = (kept: boolean | "boundary") => StyleSheet.flatten(paneStyle(contrastTheme, ring, kept)) as { borderColor?: string; borderWidth?: number };
    expect(flat("boundary")).toMatchObject({ borderColor: lightColors.foreground, borderWidth: 2 });
    expect(flat(true)).toMatchObject({ borderColor: lightColors.input, borderWidth: 2 });
    // Under glass a boundary stays a border, as a state border does.
    expect(StyleSheet.flatten(paneStyle(true, ring, "boundary"))).toMatchObject({ borderColor: lightColors.input, borderWidth: 2, backgroundColor: "transparent" });
  });

  it("renders the iOS off Switch's pane on solid's systemGray3", async () => {
    const IosSwitch = createSwitch(iosSwitchSkin);
    const { container } = await renderGlass(<IosSwitch testID="off" accessibilityLabel="Marketing" />);
    expect(rgbaOf(underFillOf(container.querySelector('[data-testid="off"]') as HTMLElement))).toEqual(rgbaOf(alpha("#c7c7cc", 1)));
  });
});

// The owner's GS-2 decision: a soft inner fill that carries text (a field's prefix or
// suffix addon, PhoneInput's country segment) is capped for its ink like a wash. The docs'
// three-up drew the iOS skin's field through the web host's dark control puck, where the
// addon's `$` read 3.93 to 3.99:1 (input/currency, input/prefix, field/helpertext,
// field/amount); the iOS device itself reads 4.76.
describe("a fill that carries ink is capped for it on the web host (GS-2)", () => {
  const panes = [
    { name: "clear field", pane: { clear: true, layer: "control" as const } },
    { name: "control puck", pane: { layer: "control" as const } },
  ];

  it("holds the muted and foreground inks at 4.5:1 plus headroom on the capped fill, never denser than the soft strength", () => {
    for (const look of LOOKS) {
      const t = look.tokens;
      const dark = look.scheme === "dark";
      const g = look.webGlass;
      for (const { name, pane } of panes) {
        const fill = legibleInnerFill({ tokens: t, glass: g, dark }, pane, "soft");
        const strength = dark ? 0.09 : 0.06;
        expect(Number(/,\s*([\d.]+)\)$/.exec(fill)![1]), `${look.name} ${name} alpha`).toBeLessThanOrEqual(strength);
        const body = pane.clear ? alpha(t.card, dark ? 0.28 : 0.22) : surfaceUnderFill(g, pane.layer);
        for (const ground of [t.background, composite(g["glass-tint-content"], t.background)]) {
          const bed = composite(fill, composite(body, ground));
          for (const ink of [t["muted-foreground"], t.foreground]) {
            expect(contrastRatio(bed, ink), `${look.name} ${name} ink on ${bed}`).toBeGreaterThanOrEqual(GLASS_WASH.inkContrast + GLASS_WASH.headroom);
          }
        }
      }
    }
  });

  it("keeps the full soft strength where the ink already holds (the dark web field) and thins the dark control puck's", () => {
    const dark = LOOKS.find((look) => look.name === "dark")!;
    const theme = { tokens: dark.tokens, glass: dark.webGlass, dark: true };
    expect(rgbaOf(legibleInnerFill(theme, { clear: true, layer: "control" }))).toEqual(rgbaOf(alpha(dark.tokens.foreground, 0.09)));
    expect(rgbaOf(legibleInnerFill(theme, { layer: "control" }))).toEqual(rgbaOf(alpha(dark.tokens.foreground, 0.03)));
  });

  it("renders the capped addon on the web host: the iOS skin's field in dark glass, and the web field's at full strength", async () => {
    const { Input: IosInput } = await import("../src/atoms/input/input.ios.tsx");
    const dark = LOOKS.find((look) => look.name === "dark")!;
    const { container } = render(
      <ThemeProvider glass dark>
        <View testID="ios"><IosInput label="Amount" prefix="$" placeholder="0.00" /></View>
        <View testID="web"><Input label="Amount" prefix="$" placeholder="0.00" /></View>
      </ThemeProvider>,
    );
    await waitFor(() => expect(materialLayers(container)).toBeGreaterThan(0));
    const addonOf = (id: string) => {
      const dollar = Array.from(container.querySelector(`[data-testid="${id}"]`)!.querySelectorAll("*"))
        .find((node) => node.textContent === "$" && node.children.length === 0)!;
      return (dollar.parentElement as HTMLElement).style.backgroundColor;
    };
    expect(rgbaOf(addonOf("ios"))).toEqual(rgbaOf(legibleInnerFill({ tokens: dark.tokens, glass: dark.webGlass, dark: true }, { layer: "control" })));
    expect(rgbaOf(addonOf("web"))).toEqual(rgbaOf(alpha(dark.tokens.foreground, 0.09)));
  });
});
