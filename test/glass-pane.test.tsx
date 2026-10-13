import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { Text, TextInput, View, type ViewStyle } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { GlassPane, paneStyle, PANE_SIBLING_INPUT } from "../src/style/glass-surface/glass-pane.tsx";
import { ButtonGroup } from "../src/atoms/button-group/button-group.tsx";
import { contrastBorderFor } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { Radio, RadioGroup } from "../src/atoms/radio/radio.tsx";
import { Steps } from "../src/organisms/steps/steps.tsx";
import { PANE_HOSTS, type PaneHost } from "./fixtures/pane-hosts.tsx";
import { onPlatform, PLATFORM_PARTS } from "./fixtures/platform-parts.tsx";
import { Autocomplete as AndroidAutocomplete } from "../src/atoms/autocomplete/autocomplete.android.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Select as AndroidSelect } from "../src/atoms/select/select.android.tsx";
import { Switch as AndroidSwitch } from "../src/atoms/switch/switch.android.tsx";
import { Textarea as AndroidTextarea } from "../src/atoms/textarea/textarea.android.tsx";
import { Steps as AndroidSteps } from "../src/organisms/steps/steps.android.tsx";

// GlassPane's geometry (the owner's GP-1 decision, audit/DECISIONS.md): under glass the
// material covers a control's whole solid footprint, as Dark Factory's glass does. The pane
// fills its host's padding box and copies no border of its own; `paneStyle` turns the host's
// resting border into padding of the same width, so the layout does not move and the padding
// box is the footprint. A state border stays a border over the pane, which sits flush inside
// it with concentric corners. A pane beside a text field covers the borderless wrapper the
// field fills, and the field's own state border paints over it. In solid mode none of it
// exists: the pane renders nothing and the host keeps its style untouched.
//
// happy-dom computes no layout, so the boxes are read the way the browser resolves them: an
// absolutely filled child lies on its parent's padding box, so a box is its parent's box
// less the parent's border on each side.

afterEach(cleanup);

type Side = "top" | "right" | "bottom" | "left";
const SIDES: readonly Side[] = ["top", "right", "bottom", "left"];
const px = (value: string) => (value === "" ? 0 : Number.parseFloat(value));
const borderOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`border-${side}-width`));
const paddingOf = (node: Element, side: Side) => px(getComputedStyle(node).getPropertyValue(`padding-${side}`));
const insetsOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side) + paddingOf(node, side)])) as Record<Side, number>;
const bordersOf = (node: Element) => Object.fromEntries(SIDES.map((side) => [side, borderOf(node, side)])) as Record<Side, number>;
const radiusOf = (node: Element) => getComputedStyle(node).getPropertyValue("border-top-left-radius");

/** A pane's root: the absolutely filled GlassBox behind its host's content. */
const isPane = (node: Element) => (node as HTMLElement).style?.zIndex === "-1" && node.querySelector(':scope > [data-testid="glass-material"]') != null;
const panesIn = (root: Element) => Array.from(root.querySelectorAll("*")).filter(isPane) as HTMLElement[];
const materialOf = (pane: Element) => pane.querySelector(':scope > [data-testid="glass-material"]') as HTMLElement;
/** The elements only glass renders: a pane, a surface's material, the clear well's state stroke. */
const glassOnly = (node: Element) => isPane(node) || node.getAttribute("data-testid") === "glass-material" || node.getAttribute("data-testid") === "text-entry-state-border";

/** A box inside a w x h host: where an absolutely filled child of `host` lies. */
function paddingBox(host: Element, width: number, height: number) {
  const b = bordersOf(host);
  return { x: b.left, y: b.top, width: width - b.left - b.right, height: height - b.top - b.bottom };
}

const SHAPE: ViewStyle = { width: 120, height: 40, borderRadius: 12, borderWidth: 2, borderColor: "#7262e5", backgroundColor: "#ffffff", paddingHorizontal: 10, paddingVertical: 4 };

async function renderGlass(ui: React.ReactElement, solid = false) {
  const result = render(<ThemeProvider light glass={!solid} solid={solid}>{ui}</ThemeProvider>);
  if (!solid) await waitFor(() => expect(result.container.querySelector('[data-testid="glass-material"]')).not.toBeNull());
  return result;
}

describe("the pane covers the host's whole solid footprint", () => {
  it("a resting bordered host: its border becomes padding, and the pane and its material fill the host's box", async () => {
    const { getByTestId } = await renderGlass(
      <View testID="host" style={paneStyle(true, SHAPE)}>
        <GlassPane shape={SHAPE} testID="pane" />
        <Text>Label</Text>
      </View>,
    );
    const host = getByTestId("host");
    // The content keeps its place: 2 of border and 10 / 4 of padding become 12 / 6 of padding.
    expect(bordersOf(host)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(insetsOf(host)).toEqual({ top: 6, right: 12, bottom: 6, left: 12 });
    const pane = getByTestId("pane");
    expect(pane.parentElement).toBe(host);
    // The pane takes the shape's radius and no border: it lies on the host's padding box, the footprint.
    expect(paddingBox(host, 120, 40)).toEqual({ x: 0, y: 0, width: 120, height: 40 });
    expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(radiusOf(pane)).toBe("12px");
    expect(pane.style.backgroundColor).toBe("rgba(0, 0, 0, 0.00)");
    // The material fills the pane: the pane has no border for it to sit inside.
    const material = materialOf(pane);
    expect(paddingBox(pane, 120, 40)).toEqual({ x: 0, y: 0, width: 120, height: 40 });
    expect(SIDES.map((side) => material.style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
    expect(radiusOf(material)).toBe("12px");
  });

  it("a host that keeps a state border: the border stays in its colour and the pane sits flush inside it with concentric corners", async () => {
    const { getByTestId } = await renderGlass(
      <View testID="host" style={paneStyle(true, SHAPE, true)}>
        <GlassPane shape={SHAPE} stateBorder testID="pane" />
        <Text>Label</Text>
      </View>,
    );
    const host = getByTestId("host");
    expect(bordersOf(host)).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
    expect(host.style.borderTopColor || host.style.borderColor).toMatch(/114, ?98, ?229/);
    expect(insetsOf(host)).toEqual({ top: 6, right: 12, bottom: 6, left: 12 });
    const pane = getByTestId("pane");
    // Inside the 2 px border, with no gap: no border of its own, the radius less the border.
    expect(paddingBox(host, 120, 40)).toEqual({ x: 2, y: 2, width: 116, height: 36 });
    expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(radiusOf(pane)).toBe("10px");
    expect(radiusOf(materialOf(pane))).toBe("10px");
  });

  it("a pane beside a text field covers the field's footprint, and the field's state border paints over it", async () => {
    const field: ViewStyle = { height: 44, borderWidth: 1, borderRadius: 10, borderColor: lightColors.input, backgroundColor: lightColors.card, paddingHorizontal: 12 };
    const Field = ({ focused }: { focused: boolean }) => (
      <View testID={focused ? "focused-wrap" : "resting-wrap"}>
        <GlassPane shape={field} clear testID={focused ? "focused-pane" : "resting-pane"} />
        <TextInput testID={focused ? "focused" : "resting"} style={[paneStyle(true, field, focused), focused ? { borderColor: lightColors.ring } : null, PANE_SIBLING_INPUT]} />
      </View>
    );
    const { getByTestId } = await renderGlass(<><Field focused={false} /><Field focused /></>);
    for (const state of ["resting", "focused"] as const) {
      const wrap = getByTestId(`${state}-wrap`);
      const pane = getByTestId(`${state}-pane`);
      // The wrapper has no border: the pane lies on its whole box, the field's footprint.
      expect(pane.parentElement).toBe(wrap);
      expect(bordersOf(wrap)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(bordersOf(pane)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(radiusOf(pane)).toBe("10px");
      // The field's text stays where solid puts it, 1 of border plus 12 of padding in.
      const input = getByTestId(state);
      expect(insetsOf(input)).toEqual({ top: 1, right: 13, bottom: 1, left: 13 });
      expect(bordersOf(input)).toEqual(state === "focused" ? { top: 1, right: 1, bottom: 1, left: 1 } : { top: 0, right: 0, bottom: 0, left: 0 });
    }
  });

  it("leaves the solid tree untouched: paneStyle returns the style itself and the pane renders nothing", async () => {
    const solid = { surface: "solid", increasedContrast: false, reducedTransparency: false, tokens: lightColors } as Parameters<typeof paneStyle>[0];
    expect(paneStyle(false, SHAPE)).toBe(SHAPE);
    expect(paneStyle(solid, SHAPE)).toBe(SHAPE);
    expect(paneStyle(solid, SHAPE, true)).toBe(SHAPE);
    const withPane = (await renderGlass(<View style={paneStyle(solid, SHAPE)}><GlassPane shape={SHAPE} stateBorder /><Text>Label</Text></View>, true)).container.innerHTML;
    cleanup();
    const plain = (await renderGlass(<View style={SHAPE}><Text>Label</Text></View>, true)).container.innerHTML;
    expect(withPane).toBe(plain);
  });

  it("reads the logical and physical sides as React Native does, and keeps a side whose padding cannot be summed", () => {
    const flat = (style: ReturnType<typeof paneStyle>) => Object.assign({}, ...[style].flat(3).filter(Boolean)) as Record<string, unknown>;
    // A start-only border (the input addon's seam) pads the start side alone.
    expect(flat(paneStyle(true, { borderStartWidth: 1, borderColor: "#000", paddingHorizontal: 8 }))).toMatchObject({ borderWidth: 0, borderStartWidth: 0, paddingStart: 9 });
    expect(flat(paneStyle(true, { borderStartWidth: 1, borderColor: "#000", paddingHorizontal: 8 })).paddingEnd).toBeUndefined();
    // A physical side key is restated physically too, so it cannot outrank the logical one on the web.
    expect(flat(paneStyle(true, { borderWidth: 1, paddingLeft: 4, paddingRight: 6 }))).toMatchObject({ paddingStart: 5, paddingLeft: 5, paddingEnd: 7, paddingRight: 7, borderLeftWidth: 0, borderRightWidth: 0 });
    // A percentage padding cannot take a border's width: that side keeps its border, cleared.
    expect(flat(paneStyle(true, { borderWidth: 1, borderColor: "#000", paddingTop: "5%", padding: 4 }))).toMatchObject({ borderTopWidth: 1, borderColor: "transparent", paddingTop: "5%", paddingBottom: 5, paddingStart: 5 });
  });
});

describe("every pane host keeps its solid layout under glass", () => {
  // The same tree renders in solid and in glass; with the glass-only elements left out the
  // two trees line up node for node, so each pane host has its solid twin.
  function twinOf(node: Element, glassRoot: Element, solidRoot: Element): Element | null {
    const path: number[] = [];
    for (let at: Element = node; at !== glassRoot; at = at.parentElement!) {
      path.unshift(Array.from(at.parentElement!.children).filter((child) => !glassOnly(child)).indexOf(at));
    }
    let twin: Element | undefined = solidRoot;
    for (const index of path) twin = twin?.children[index];
    return twin ?? null;
  }

  /** A placed child's offsets on one axis from its parent's outer edge: the pinned side, or the centre when both are. */
  function placement(child: Element, parent: Element, start: Side, end: Side): number | null {
    const at = (side: Side) => {
      const value = getComputedStyle(child).getPropertyValue(side);
      return value === "" || value === "auto" ? null : px(value) + borderOf(parent, side);
    };
    const [a, b] = [at(start), at(end)];
    if (a != null && b != null) return a - b;
    return a ?? (b == null ? null : -b);
  }

  async function holdsSolidLayout(name: string, node: ReactNode, act: PaneHost["act"], indicatorReplaced: boolean, optional = false) {
    const solid = render(<ThemeProvider light solid>{node}</ThemeProvider>);
    act?.(solid);
    const glass = render(<ThemeProvider light glass>{node}</ThemeProvider>);
    act?.(glass);
    // A platform skin may paint no pane for a host the web paints one for (Android's
    // segmented Progress, its Tabs, a native Video): nothing to hold there.
    if (optional) await new Promise((resolve) => setTimeout(resolve, 20));
    else await waitFor(() => expect(panesIn(glass.container).length).toBeGreaterThan(0));
    for (const pane of panesIn(glass.container)) {
      const host = pane.parentElement!;
      const twin = twinOf(host, glass.container, solid.container);
      expect(twin, `${name}: the pane host has a solid twin`).not.toBeNull();
      // The content stays where solid puts it: each side's border plus padding is solid's.
      expect(insetsOf(host), `${name}: insets`).toEqual(insetsOf(twin!));
      // Absolutely placed content (a switch thumb, a slider tick) keeps its place too: its
      // offset from the host's outer edge is solid's, and a layer pinned to both sides of an
      // axis (a centred glyph layer) keeps its centre.
      const placed = Array.from(host.children).filter((child) => !glassOnly(child) && getComputedStyle(child).position === "absolute");
      const solidPlaced = Array.from(twin!.children).filter((child) => getComputedStyle(child).position === "absolute");
      if (indicatorReplaced) expect(placed.length, `${name}: the pane replaces solid's indicator view`).toBe(solidPlaced.length - 1);
      else expect(placed.length, `${name}: absolutely placed children`).toBe(solidPlaced.length);
      if (placed.length === solidPlaced.length) {
        placed.forEach((child, i) => {
          for (const [start, end] of [["top", "bottom"], ["left", "right"]] as const) {
            expect(placement(child, host, start, end), `${name}: placed child ${i} ${start}-${end}`).toEqual(placement(solidPlaced[i]!, twin!, start, end));
          }
        });
      }
      // The pane paints no border of its own, and the material fills it.
      expect(bordersOf(pane), `${name}: pane border`).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
      expect(SIDES.map((side) => materialOf(pane).style.getPropertyValue(side))).toEqual(["0px", "0px", "0px", "0px"]);
      // A host with no border left lends the pane its own corners (a pane beside a field, in
      // a wrapper with none, the field's); one that kept a state border, its inner curve.
      const kept = bordersOf(host);
      const corner = radiusOf(twin!) || radiusOf(pane.nextElementSibling!);
      if (SIDES.every((side) => kept[side] === 0)) expect(radiusOf(pane), `${name}: pane radius`).toBe(corner);
      else expect(px(radiusOf(pane)), `${name}: concentric pane radius`).toBe(Math.max(0, px(corner) - Math.min(kept.top, kept.left)));
    }
    glass.unmount();
    solid.unmount();
  }

  // Where solid paints the active indicator as a view of its own and glass paints the pane
  // in its place (TabBar's cell capsule), solid has the one placed child more.
  const REPLACED_INDICATOR = new Set(["TabBar"]);
  for (const host of PANE_HOSTS) {
    it(host.name, () => holdsSolidLayout(host.name, host.node, host.act, REPLACED_INDICATOR.has(host.name)));
  }

  // The iOS and Android skins draw their own borders (Android's 2 dp switch track and radio
  // ring, the M3 field's indicator, the iOS cell) through the same shells: each host renders
  // again with every kit component swapped for its platform entry's.
  for (const platform of ["ios", "android"] as const) {
    for (const host of PANE_HOSTS) {
      const node = onPlatform(host.node, PLATFORM_PARTS[platform]);
      if (node === host.node) continue;
      it(`${host.name} (${platform} skin)`, () => holdsSolidLayout(`${host.name} (${platform})`, node, host.act, REPLACED_INDICATOR.has(host.name) && platform === "ios", true));
    }
  }

  it("ButtonGroup: a cell paneStyle clears keeps solid's insets", async () => {
    const node = <ButtonGroup items={["Day", "Week", "Month"]} accessibilityLabel="Range" testID="range" />;
    const solid = render(<ThemeProvider light solid>{node}</ThemeProvider>);
    const glass = await renderGlass(node);
    const cells = (root: Element) => Array.from(root.querySelectorAll('[role="tab"], [role="button"]'));
    const [glassCells, solidCells] = [cells(glass.container), cells(solid.container)];
    expect(glassCells.length).toBe(3);
    glassCells.forEach((cell, i) => expect(insetsOf(cell)).toEqual(insetsOf(solidCells[i]!)));
  });
});

describe("Increase Contrast only ever adds weight", () => {
  // Under Increase Contrast every material resolves solid and a pane host takes the
  // contrasting border (contrastBorderFor, through paneStyle): `foreground` on every side,
  // at least the hairline and never thinner than the host's own border, so a 2 px ring stays
  // 2 px. A border that shows a state keeps its colour.
  const fg = lightColors.foreground;

  it("contrastBorderFor keeps each side's own width when it is wider than the hairline", () => {
    expect(contrastBorderFor(lightColors, {})).toEqual({ borderWidth: 1, borderColor: fg });
    expect(contrastBorderFor(lightColors, { borderWidth: 1, borderColor: "#ccc" })).toEqual({ borderWidth: 1, borderColor: fg });
    expect(contrastBorderFor(lightColors, { borderWidth: 2, borderColor: "#ccc" })).toEqual({ borderWidth: 2, borderColor: fg });
    // An underline field: the hairline all round, its 2 px indicator kept, every side in foreground.
    expect(contrastBorderFor(lightColors, { borderBottomWidth: 2, borderBottomColor: "#888" })).toEqual({
      borderWidth: 1, borderColor: fg, borderTopWidth: 1, borderBottomWidth: 2, borderStartWidth: 1, borderEndWidth: 1, borderBottomColor: fg,
    });
    // A state border keeps its colour and its width.
    expect(contrastBorderFor(lightColors, { borderWidth: 2, borderColor: lightColors.ring }, true)).toEqual({ borderWidth: 2, borderColor: lightColors.ring });
    // A Material 3 underline field's state is its bottom edge, the active indicator: that edge
    // keeps its colour, and the sides it names no colour for take the contrasting hairline.
    expect(contrastBorderFor(lightColors, { borderBottomWidth: 2, borderBottomColor: lightColors.destructive }, true)).toEqual({
      borderWidth: 1, borderColor: fg, borderTopWidth: 1, borderBottomWidth: 2, borderStartWidth: 1, borderEndWidth: 1, borderBottomColor: lightColors.destructive,
    });
    // A state style that names no border colour has no state border to keep.
    expect(contrastBorderFor(lightColors, { borderWidth: 2 }, true)).toEqual({ borderWidth: 2, borderColor: fg });
  });

  function contrastMore() {
    return spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("prefers-contrast"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          onchange: null,
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList,
    );
  }
  const channels = (color: string) => (/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color) ?? []).slice(1, 4).join(",");
  const hex = (color: string) => { const n = Number.parseInt(color.slice(1, 7), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
  const ring = (node: Element) => ({ width: borderOf(node, "top"), color: channels(getComputedStyle(node).getPropertyValue("border-top-color") || (node as HTMLElement).style.borderColor) });

  it("a 2 px radio ring stays 2 px, in foreground, checked or not", async () => {
    const spy = contrastMore();
    try {
      render(<ThemeProvider light solid><RadioGroup defaultValue="pro" label="Plan"><Radio value="hobby">Hobby</Radio><Radio value="pro">Pro</Radio></RadioGroup></ThemeProvider>);
      await waitFor(() => expect(ring(screen.getAllByRole("radio")[0]!.firstElementChild!).color).toBe(hex(fg)));
      for (const radio of screen.getAllByRole("radio")) expect(ring(radio.firstElementChild!)).toEqual({ width: 2, color: hex(fg) });
    } finally { spy.mockRestore(); }
  });

  it("a Material 3 underline field keeps its state colour on its active indicator", async () => {
    // The Android Input, Textarea, Select and Autocomplete draw their state on the bottom edge
    // alone (activeIndicator): an error in destructive, focus in ring, an open trigger in
    // primary, each 2 dp. Increase Contrast keeps that colour and width; a resting field's
    // 1 dp indicator takes the foreground.
    const spy = contrastMore();
    try {
      render(
        <ThemeProvider light solid>
          <AndroidInput label="Name" error />
          <AndroidTextarea label="Notes" error />
          <AndroidInput label="Email" />
          <AndroidInput label="Phone" />
          <AndroidSelect label="Country" options={["Canada", "Mexico"]} />
          <AndroidAutocomplete label="Assigned to" options={["Ada Lovelace", "Grace Hopper"]} />
        </ThemeProvider>,
      );
      const indicator = (node: Element) => {
        let at: Element | null = node;
        while (at && borderOf(at, "bottom") === 0) at = at.parentElement;
        return at ? { width: borderOf(at, "bottom"), color: channels(getComputedStyle(at).getPropertyValue("border-bottom-color")) } : null;
      };
      const [name, email, phone, assigned] = Array.from(document.querySelectorAll("input"));
      const notes = document.querySelector("textarea")!;
      await waitFor(() => expect(indicator(phone!)).toEqual({ width: 1, color: hex(fg) }));
      expect(indicator(name!)).toEqual({ width: 2, color: hex(lightColors.destructive) });
      expect(indicator(notes)).toEqual({ width: 2, color: hex(lightColors.destructive) });
      fireEvent.focus(email!);
      await waitFor(() => expect(indicator(email!)).toEqual({ width: 2, color: hex(lightColors.ring) }));
      fireEvent.focus(assigned!);
      await waitFor(() => expect(indicator(assigned!)).toEqual({ width: 2, color: hex(lightColors.ring) }));
      const trigger = screen.getAllByRole("button").find((node) => node.textContent?.includes("Country"))!;
      expect(indicator(trigger)).toEqual({ width: 1, color: hex(fg) });
      fireEvent.click(trigger);
      await waitFor(() => expect(indicator(trigger)).toEqual({ width: 2, color: hex(lightColors.primary) }));
    } finally { spy.mockRestore(); }
  });

  it("the Android switch's 2 dp unchecked track stays 2 dp", async () => {
    const spy = contrastMore();
    try {
      render(<ThemeProvider light solid><AndroidSwitch accessibilityLabel="Wi-Fi" /></ThemeProvider>);
      const track = () => screen.getByRole("switch").lastElementChild!;
      await waitFor(() => expect(ring(track()).color).toBe(hex(fg)));
      expect(ring(track())).toEqual({ width: 2, color: hex(fg) });
    } finally { spy.mockRestore(); }
  });

  it("Steps: the completed and upcoming discs keep 2 px in foreground, and Android's current ring keeps its 2 dp primary", async () => {
    const spy = contrastMore();
    try {
      const steps = [{ label: "Account" }, { label: "Profile" }, { label: "Review" }];
      render(<ThemeProvider light solid><Steps steps={steps} defaultCurrent={1} /><AndroidSteps steps={steps} defaultCurrent={1} /></ThemeProvider>);
      await waitFor(() => expect(ring(screen.getAllByText("3")[0]!.parentElement!).color).toBe(hex(fg)));
      const [web, android] = [0, 1].map((i) => ({ done: screen.getAllByText("✓")[i]!.parentElement!, current: screen.getAllByText("2")[i]!.parentElement!, next: screen.getAllByText("3")[i]!.parentElement! }));
      for (const platform of [web, android]) {
        expect(ring(platform.done).width).toBe(2);
        expect(ring(platform.next)).toEqual({ width: 2, color: hex(fg) });
      }
      // The current step's ring is its state: it keeps its colour (the web ring paints no surface and never changed).
      expect(ring(android.current)).toEqual({ width: 2, color: hex(lightColors.primary) });
      expect(ring(web.current)).toEqual({ width: 2, color: hex(lightColors.primary) });
    } finally { spy.mockRestore(); }
  });
});
