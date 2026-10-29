import { describe, it, expect, afterEach } from "bun:test";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { type ReactNode } from "react";
import { ThemeProvider } from "../src/style/theme.tsx";
import { Chip } from "../src/atoms/chip/chip.tsx";

afterEach(cleanup);
const ui = (node: ReactNode) => render(<ThemeProvider>{node}</ThemeProvider>);

describe("Chip", () => {
  it("interactive + removable renders two sibling buttons (no button-in-button)", () => {
    const { container } = ui(
      <Chip selectable onPress={() => {}} onRemove={() => {}}>Tag</Chip>,
    );
    const buttons = [...container.querySelectorAll('[role="button"]')];
    expect(buttons.length).toBe(2);
    // Neither button contains the other: the invalid nesting is gone.
    expect(buttons[0].contains(buttons[1])).toBe(false);
    expect(buttons[1].contains(buttons[0])).toBe(false);
  });

  it("pressing remove fires only onRemove, never the toggle", () => {
    let toggled = 0;
    let removed = 0;
    ui(
      <Chip selectable onPress={() => { toggled += 1; }} onRemove={() => { removed += 1; }}>Tag</Chip>,
    );
    fireEvent.click(screen.getByLabelText("Remove Tag"));
    expect(removed).toBe(1);
    expect(toggled).toBe(0);
  });

  it("interactive without a remove control stays a single button", () => {
    const { container } = ui(<Chip selectable onPress={() => {}}>Tag</Chip>);
    expect(container.querySelectorAll('[role="button"]').length).toBe(1);
  });
});

// The hand-off's chip (`K.def('chip')` in tools/v4/handoff/cv-kit-controls.js, its Android
// row in cv-kit-platform.js), pinned as the skins and the shell render it.
import { StyleSheet } from "react-native";
import { webSkin, iosSkin, androidSkin } from "../src/atoms/chip/chip.styles.ts";
import { Chip as AndroidChip } from "../src/atoms/chip/chip.android.tsx";
import { darkColors, lightColors } from "../src/style/tokens.ts";
import { alpha, channelsOf, oklchHex } from "../src/style/color.ts";
import { hueChip } from "../src/atoms/chip/chip.shared.tsx";
import { statusColors } from "../src/style/status.ts";

const at = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`) as HTMLElement;
const rgb = (c: string) => channelsOf(c)?.slice(0, 3);

describe("Chip takes the hand-off's look", () => {
  it("web: a 28px full-round pill, 6 between elements, a 500 13px label, 12px sides", () => {
    const base = StyleSheet.flatten(webSkin.base);
    expect(base.height).toBe(28);
    expect(base.borderRadius).toBeGreaterThanOrEqual(999);
    expect(base.borderWidth).toBe(1);
    expect(base.gap).toBe(6);
    expect(webSkin.labelType).toMatchObject({ fontSize: 13, fontWeight: "500" });
    expect(webSkin.sidePadding).toEqual({ text: 12, icon: 8, remove: 6 });
    expect(webSkin.countType).toMatchObject({ fontSize: 11, fontWeight: "500", opacity: 0.7 });
    expect(webSkin.removeSize).toBe(18);
    expect(webSkin.removeGlyph).toBe(11);
    expect(webSkin.hoverBrightness).toBe(1.12);
    expect(webSkin.disabledOpacity).toBe(0.4);
    expect(webSkin.selectedCheck).toEqual({ size: 13, replacesIcon: false });
  });

  it("iOS ships no chip, so its skin is the web skin", () => {
    expect(iosSkin).toBe(webSkin);
  });

  it("Android: the 32dp M3 chip at the 8dp corner, 16dp sides (8 beside an icon), label-large, 0.38 disabled", () => {
    const base = StyleSheet.flatten(androidSkin.base);
    expect(base.height).toBe(32);
    expect(base.borderRadius).toBe(8);
    expect(base.gap).toBe(8);
    expect(androidSkin.labelType).toMatchObject({ fontSize: 14, lineHeight: 20, fontWeight: "500" });
    expect(androidSkin.sidePadding).toEqual({ text: 16, icon: 8, remove: 8 });
    expect(androidSkin.selectedCheck).toEqual({ size: 18, replacesIcon: true });
    expect(androidSkin.disabledOpacity).toBe(0.38);
  });

  it("web: the idle chip is the raised neutral fill inside the hairline; outline is the field border on nothing", () => {
    const { container } = ui(<><Chip testID="idle">A</Chip><Chip testID="out" outline>B</Chip><Chip testID="ok" success outline>C</Chip></>);
    expect(rgb(at(container, "idle").style.backgroundColor)).toEqual(rgb(lightColors.secondary));
    expect(channelsOf(at(container, "idle").style.borderColor)).toEqual(channelsOf(lightColors.border));
    expect(at(container, "out").style.backgroundColor).toMatch(/^$|transparent|rgba\(0, 0, 0, 0(\.0+)?\)/);
    expect(channelsOf(at(container, "out").style.borderColor)).toEqual(channelsOf(lightColors["field-border"]!));
    // A toned outline keeps the tone's ink inside the same edge.
    expect(channelsOf(at(container, "ok").style.borderColor)).toEqual(channelsOf(lightColors["field-border"]!));
    const ink = [...at(container, "ok").querySelectorAll("*")].find((n) => n.textContent === "C" && (n as HTMLElement).style.color) as HTMLElement;
    expect(rgb(ink.style.color)).toEqual(rgb(statusColors(lightColors, "success").ink));
  });

  it("the muted tag is the neutral fill with no edge in the muted ink", () => {
    const { container } = ui(<Chip testID="n" neutral>N</Chip>);
    expect(rgb(at(container, "n").style.backgroundColor)).toEqual(rgb(lightColors.secondary));
    expect(at(container, "n").style.borderColor).toMatch(/transparent|rgba\(0, 0, 0, 0(\.0+)?\)/);
  });

  it("the remove control is an 18px disc around the glyph, and the side beside it is 6px", () => {
    const { container } = ui(<Chip testID="r" onRemove={() => {}}>Role</Chip>);
    const disc = screen.getByLabelText("Remove Role");
    expect(disc.style.width).toBe("18px");
    expect(disc.style.height).toBe("18px");
    expect(disc.style.backgroundColor).toBe("rgba(127, 127, 127, 0.18)");
    const s = at(container, "r").style;
    expect(s.paddingInlineEnd || s.paddingRight).toBe("6px");
    expect(s.paddingInlineStart || s.paddingLeft).toBe("12px");
  });

  it("a count is the mono numeral", () => {
    ui(<Chip count={12}>Design</Chip>);
    const count = screen.getByText("12");
    expect(count.style.fontSize).toBe("11px");
    expect(count.style.fontWeight).toBe("500");
  });

  it("Android: the idle chip is the bare container inside the field border; `secondary` fills it with no edge", () => {
    const { container } = ui(<><AndroidChip testID="a">A</AndroidChip><AndroidChip testID="s" secondary>S</AndroidChip></>);
    expect(at(container, "a").style.backgroundColor).toMatch(/^$|transparent|rgba\(0, 0, 0, 0(\.0+)?\)/);
    expect(channelsOf(at(container, "a").style.borderColor)).toEqual(channelsOf(lightColors["field-border"]!));
    expect(rgb(at(container, "s").style.backgroundColor)).toEqual(rgb(lightColors.secondary));
    expect(at(container, "s").style.borderColor).toMatch(/transparent|rgba\(0, 0, 0, 0(\.0+)?\)/);
  });
});

// The Tokens chip (Component.dc.html line 294) and the icon knob's "none" tile (line 163),
// as the `token` look and `square` draw them.
import { lookOf } from "../src/atoms/chip/chip.shared.tsx";
import { ChipGroup } from "../src/atoms/chip/chip-group.tsx";
import { Icon } from "../src/atoms/icon/icon.tsx";

const labelOf = (c: HTMLElement, text: string) => [...c.querySelectorAll("*")].find((n) => n.textContent === text && (n as HTMLElement).style.fontSize) as HTMLElement;

describe("Chip's token look and square option (the hand-off's Tokens chip and icon tile)", () => {
  it("web: the token skin is the 32px pill, 8 between elements, 12 beside text and 6 beside the swatch, a 500 12px mono label, no check, no hover", () => {
    const token = webSkin.token!;
    const base = StyleSheet.flatten(token.base);
    expect(base.height).toBe(32);
    expect(base.borderRadius).toBeGreaterThanOrEqual(999);
    expect(base.borderWidth).toBe(1);
    expect(base.gap).toBe(8);
    expect(token.sidePadding).toEqual({ text: 12, icon: 6, remove: 6 });
    expect(token.labelType).toMatchObject({ fontSize: 12, lineHeight: 16, fontWeight: "500" });
    expect(String(token.labelType.fontFamily)).toContain("monospace");
    expect(token.selectedCheck).toBeNull();
    expect(token.hoverBrightness).toBeUndefined();
    expect(iosSkin.token).toBe(webSkin.token);
  });

  it("`token` wins over `option`; neither is the chip itself", () => {
    expect(lookOf({ token: true, option: true })).toBe("token");
    expect(lookOf({ option: true })).toBe("option");
    expect(lookOf({})).toBeNull();
  });

  it("a token chip is the card fill inside the hairline in the foreground ink, 32 tall, its label mono", () => {
    const { container } = ui(<Chip testID="t" token icon={<Icon tag size={14} decorative />}>primary</Chip>);
    const s = at(container, "t").style;
    expect(s.height).toBe("32px");
    expect(rgb(s.backgroundColor)).toEqual(rgb(lightColors.card));
    expect(channelsOf(s.borderColor)).toEqual(channelsOf(lightColors.border));
    expect(s.paddingInlineStart || s.paddingLeft).toBe("6px");
    expect(s.paddingInlineEnd || s.paddingRight).toBe("12px");
    const label = labelOf(container, "primary");
    expect(label.style.fontSize).toBe("12px");
    expect(label.style.fontFamily).toContain("monospace");
    expect(rgb(label.style.color)).toEqual(rgb(lightColors.foreground));
  });

  it("Android has no token look: the chip stays the 32dp Material chip at the 8dp corner with its label-large", () => {
    expect(androidSkin.token).toBeUndefined();
    const { container } = ui(<AndroidChip testID="a" token>primary</AndroidChip>);
    const s = at(container, "a").style;
    expect(s.height).toBe("32px");
    expect(s.borderTopLeftRadius).toBe("8px");
    expect(labelOf(container, "primary").style.fontSize).toBe("14px");
  });

  it("`square` holds an option with a label to the 30px tile and sets the label in the 500 10px mono tile type", () => {
    const { container } = ui(
      <ChipGroup option accessibilityLabel="Icon" defaultValue="">
        <Chip testID="none" value="" square>none</Chip>
        <Chip testID="plus" value="plus" icon={<Icon plus size={14} decorative />} accessibilityLabel="plus" />
        <Chip testID="label" value="x">label</Chip>
      </ChipGroup>,
    );
    for (const id of ["none", "plus"]) {
      const s = at(container, id).style;
      expect(s.width).toBe("30px");
      expect(s.height).toBe("30px");
      expect(s.borderTopLeftRadius).toBe("8px");
      expect(s.justifyContent).toBe("center");
    }
    const none = labelOf(container, "none").style;
    expect([none.fontSize, none.lineHeight, none.fontWeight]).toEqual(["10px", "12px", "500"]);
    expect(none.fontFamily).toContain("monospace");
    // The automatic rule is untouched: a labelled option with no icon is still the 26px pill.
    const pill = at(container, "label").style;
    expect(pill.height).toBe("26px");
    expect(pill.width).toBe("");
    expect(labelOf(container, "label").style.fontSize).toBe("12px");
  });

  it("`square` is ignored off the option look", () => {
    const { container } = ui(<Chip testID="s" square>Design</Chip>);
    expect(at(container, "s").style.height).toBe("28px");
    expect(at(container, "s").style.width).toBe("");
  });
});

describe("Chip's colour flags and neutral emphases, as the hand-off's override draws them", () => {
  const paint = (el: HTMLElement) => [channelsOf(el.style.backgroundColor), channelsOf(el.style.borderTopColor || el.style.borderColor)];
  it("a free hue is its oklch wash at 16% inside the same colour at 30%, under its solved ink", () => {
    render(<ThemeProvider dark solid><Chip red testID="red">Bug</Chip></ThemeProvider>);
    const chip = hueChip("red", darkColors, true);
    expect(chip.wash).toBe(alpha(oklchHex(0.7, 0.15, 25), 0.16));
    expect(chip.edge).toBe(alpha(oklchHex(0.7, 0.15, 25), 0.3));
    expect(paint(screen.getByTestId("red"))).toEqual([channelsOf(chip.wash), channelsOf(chip.edge)]);
  });

  it("`secondary` is the higher raised fill with no edge; a selectable chip at rest is the bare container in the field border", () => {
    render(<ThemeProvider light solid>
      <Chip secondary testID="sec">Two</Chip>
      <Chip selectable testID="rest">Engineering</Chip>
      <Chip gray testID="gray">Archived</Chip>
      <Chip neutral testID="neutral">Skipped</Chip>
    </ThemeProvider>);
    expect(paint(screen.getByTestId("sec"))).toEqual([channelsOf(lightColors["surface-raised"]!), [0, 0, 0, 0]]);
    expect(paint(screen.getByTestId("rest"))).toEqual([[0, 0, 0, 0], channelsOf(lightColors["field-border"]!)]);
    expect(paint(screen.getByTestId("gray"))).toEqual([channelsOf(lightColors.secondary), channelsOf(lightColors.border)]);
    expect(paint(screen.getByTestId("neutral"))).toEqual([channelsOf(lightColors.secondary), [0, 0, 0, 0]]);
  });
});

// `href`: the hand-off's component chips (26 px pills linking to a component page) are a
// Chip that is a link, Button's anchor path (P5-C1).
import { InteractionOverride } from "../src/style/interaction-override.tsx";
import { primaryText } from "../src/style/primary-text.ts";

describe("Chip href", () => {
  it("is one link to its destination on the web, never a toggle", () => {
    render(<ThemeProvider light solid><Chip outline href="/components/button">Button</Chip></ThemeProvider>);
    const link = screen.getByRole("link", { name: "Button" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/components/button");
    expect(link.hasAttribute("aria-pressed")).toBe(false);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("forwards hrefAttrs and calls onPress with the press event, so a client router can take the click", () => {
    let prevented = false;
    render(<ThemeProvider light solid>
      <Chip outline href="https://example.com" hrefAttrs={{ target: "_blank", rel: "noreferrer" }} onPress={(event) => { event?.preventDefault(); prevented = true; }}>Docs</Chip>
    </ThemeProvider>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
    fireEvent.click(link);
    expect(prevented).toBe(true);
  });

  it("drops the anchor while disabled, as Button does", () => {
    render(<ThemeProvider light solid><Chip outline disabled href="/components/button">Button</Chip></ThemeProvider>);
    const link = screen.getByRole("link", { name: "Button" });
    expect(link.hasAttribute("href")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
  });

  it("is ignored on a selectable chip, which stays a toggle", () => {
    render(<ThemeProvider light solid><Chip selectable href="/components/button">Button</Chip></ThemeProvider>);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Button" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("hovers to the accent ink inside an accent edge instead of brightening", () => {
    render(<ThemeProvider light solid>
      <InteractionOverride hovered>
        <Chip outline href="/components/button" testID="link">Button</Chip>
        <Chip onPress={() => {}} testID="tag">Tag</Chip>
      </InteractionOverride>
    </ThemeProvider>);
    const link = screen.getByTestId("link");
    expect(channelsOf(link.style.borderTopColor || link.style.borderColor)).toEqual(channelsOf(lightColors.primary));
    expect(link.style.filter).toBe("");
    expect(channelsOf(screen.getByText("Button").style.color)).toEqual(channelsOf(primaryText(lightColors)));
    // An ordinary tappable chip keeps its brightening.
    expect(screen.getByTestId("tag").style.filter).toContain("brightness");
  });
});
