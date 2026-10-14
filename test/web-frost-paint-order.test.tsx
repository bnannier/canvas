import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Text, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassSurface } from "../src/style/glass-surface/glass-surface.tsx";
import { GlassPane, paneStyle } from "../src/style/glass-surface/glass-pane.tsx";
import { WEB_FROST } from "../src/style/glass-surface/web-frost.ts";
import { lightColors, type GlassTokens } from "../src/style/tokens.ts";
import { LOOKS, lookProps } from "./fixtures/looks.ts";
import { PANE_HOSTS } from "./fixtures/pane-hosts.tsx";
import type { GlassLayer } from "../src/style/glass-surface/glass-surface.shared.tsx";

// The web frost's paint order (glass-surface-web-frost-self-sample-1). A CSS backdrop filter
// blurs everything painted before it, so whatever a surface paints beneath its own frost is
// blurred into its material: the materials law's "no material may sample itself". Dark
// Factory's frost is one element carrying the tint as its background and the blur as its
// backdrop filter, and CSS paints an element's background over its filtered backdrop, so the
// tint lies over the blurred page. The kit's web host painted the layer's tint as a layer
// BENEATH its blur instead: the blur sampled the tint, and at a rounded corner the wedges
// outside the tint's curve, where the page shows unfilled, were blurred into the corner as
// faint hard-edged blocks (the docs Dialog's top corners over its scrim, in blush and mint).
//
// The rule held here: inside every web glass material the frost is the first layer, nothing
// beneath it paints (the material clip, the surface's own host and, for a pane, the host the
// pane paints behind), and the fill comes after it, then the rim. It is checked for every
// layer, a brand, a wash, a sheer pane and a state border on the bare host, and for every kit
// file that renders a GlassPane, in blush, mint and dark.

afterEach(cleanup);

const EMPTY = /^(|transparent|rgba\(0, 0, 0, 0(\.0+)?\))$/;
const paints = (el: HTMLElement) => !EMPTY.test(el.style.backgroundColor) || (el.style.boxShadow !== "" && el.style.boxShadow !== "none");

interface Order { frost: number; fill: number; rim: number; beneath: string[] }

// Reads one material clip: where its frost, fill and rim sit, and what a frost would sample
// of the surface itself (any layer before it that paints, the clip, the host, a pane's host).
function orderOf(material: HTMLElement): Order {
  const layers = Array.from(material.children) as HTMLElement[];
  const frost = layers.findIndex((layer) => layer.style.backdropFilter !== "");
  const fill = layers.findIndex((layer) => !EMPTY.test(layer.style.backgroundColor));
  const rim = layers.findIndex((layer) => layer.style.boxShadow.startsWith("inset"));
  const beneath: string[] = [];
  layers.slice(0, Math.max(frost, 0)).forEach((layer, i) => { if (paints(layer)) beneath.push(`layer ${i}: ${layer.getAttribute("style")}`); });
  if (paints(material)) beneath.push(`clip: ${material.getAttribute("style")}`);
  const root = material.parentElement as HTMLElement;
  if (!EMPTY.test(root.style.backgroundColor)) beneath.push(`host fill ${root.style.backgroundColor}`);
  // A pane orders itself behind its host's content (`zIndex: -1`), over the host's own box.
  if (root.style.zIndex === "-1" && root.parentElement && !EMPTY.test(root.parentElement.style.backgroundColor)) {
    beneath.push(`pane host fill ${root.parentElement.style.backgroundColor}`);
  }
  return { frost, fill, rim, beneath };
}

function expectFrostFirst(material: HTMLElement, what: string) {
  const order = orderOf(material);
  expect(order.frost, `${what}: the frost`).toBe(0);
  expect(order.beneath, `${what}: painted beneath the frost`).toEqual([]);
  expect(order.fill, `${what}: the fill over the frost`).toBeGreaterThan(order.frost);
  expect(order.rim, `${what}: the rim over the fill`).toBeGreaterThan(order.fill);
}

const materialsIn = (root: ParentNode) => Array.from(root.querySelectorAll('[data-testid="glass-material"]')) as HTMLElement[];
const frosted = (root: ParentNode) => materialsIn(root).filter((m) => Array.from(m.children).some((c) => (c as HTMLElement).style.backdropFilter !== ""));

const LAYERS: readonly GlassLayer[] = ["functional", "content", "control", "dense"];

describe("the web frost samples nothing of its own surface", () => {
  for (const look of LOOKS) {
    it(`paints every layer's fill over its blur, then the rim, in ${look.name}`, async () => {
      const { container } = render(
        <ThemeProvider {...lookProps(look)} glass>
          {LAYERS.map((layer) => (
            <GlassSurface key={layer} testID={layer} layer={layer} style={{ backgroundColor: lightColors.card, borderRadius: 14, borderWidth: 1, borderColor: lightColors.border }}>
              <Text>{layer}</Text>
            </GlassSurface>
          ))}
          <GlassSurface testID="brand" layer="control" brand={lightColors.primary} style={{ borderRadius: 999 }}><Text>brand</Text></GlassSurface>
          <GlassSurface testID="wash" layer="content" tint="rgba(37, 99, 235, 0.12)" style={{ borderRadius: 12 }}><Text>wash</Text></GlassSurface>
          <GlassSurface testID="sheer" layer="content" sheer style={{ borderRadius: 12 }}><Text>sheer</Text></GlassSurface>
          <GlassSurface testID="state" layer="content" stateBorder style={{ borderRadius: 12, borderWidth: 2, borderColor: lightColors.primary }}><Text>state</Text></GlassSurface>
        </ThemeProvider>,
      );
      await waitFor(() => expect(frosted(container)).toHaveLength(8));
      for (const id of [...LAYERS, "brand", "wash", "sheer", "state"]) {
        const material = container.querySelector(`[data-testid="${id}"] > [data-testid="glass-material"]`) as HTMLElement;
        expectFrostFirst(material, `${look.name} ${id}`);
        // The frost itself: one 24 px blur and no fill of its own, so its fill is the layer above.
        const frost = material.children[0] as HTMLElement;
        expect(frost.style.backdropFilter).toBe(`blur(${WEB_FROST.blur}px)`);
        expect(EMPTY.test(frost.style.backgroundColor)).toBe(true);
      }
      // The fill keeps its colour and the sheer pane its opacity, over the blur now.
      const fillOf = (id: string) => (container.querySelector(`[data-testid="${id}"] > [data-testid="glass-material"]`) as HTMLElement).children[1] as HTMLElement;
      const tint = (key: keyof GlassTokens) => look.webGlass[key];
      expect(rgba(fillOf("functional").style.backgroundColor)).toEqual(rgba(tint("glass-tint")));
      expect(rgba(fillOf("content").style.backgroundColor)).toEqual(rgba(tint("glass-tint-content")));
      expect(rgba(fillOf("control").style.backgroundColor)).toEqual(rgba(tint("glass-tint-control")));
      expect(rgba(fillOf("dense").style.backgroundColor)).toEqual(rgba(tint("glass-tint-dense")));
      expect(rgba(fillOf("wash").style.backgroundColor)).toEqual(rgba("rgba(37, 99, 235, 0.12)"));
      expect(fillOf("sheer").style.opacity).toBe(String(WEB_FROST.sheerFillOpacity));
    });
  }

  it("paints a pane's fill over its blur, inside a host whose own fill gives way under glass", async () => {
    const shape = { backgroundColor: lightColors.card, borderRadius: 10, borderWidth: 1, borderColor: lightColors.border, padding: 8 };
    const { container } = render(
      <ThemeProvider light glass>
        <View testID="pane-host" style={paneStyle(true, shape)}>
          <GlassPane layer="control" shape={shape} />
          <Text>pane</Text>
        </View>
      </ThemeProvider>,
    );
    await waitFor(() => expect(frosted(container)).toHaveLength(1));
    expectFrostFirst(frosted(container)[0]!, "pane");
  });

  // How many frosts each host rendered, so the sweep cannot pass by finding none: a host whose
  // panes are all clear (a text field's veil) has no frost to order and passes trivially.
  const swept = new Map<string, number>();
  for (const host of PANE_HOSTS) {
    it(`${host.name}: every frost it renders is the first layer of its material`, async () => {
      for (const look of LOOKS) {
        const result = render(<ThemeProvider {...lookProps(look)} glass>{host.node}</ThemeProvider>);
        host.act?.(result);
        await waitFor(() => expect(materialsIn(result.container).length).toBeGreaterThan(0));
        const frosts = frosted(result.container);
        for (const material of frosts) expectFrostFirst(material, `${host.name} ${look.name}`);
        swept.set(host.name, (swept.get(host.name) ?? 0) + frosts.length);
        result.unmount();
      }
    });
  }

  it("found frosts across the pane hosts, so the sweep is not vacuous", () => {
    expect([...swept.values()].filter((n) => n > 0).length).toBeGreaterThan(40);
  });
});

// react-native-web stores an alpha as an 8-bit channel and prints it with two decimals, so
// colours compare as numbers quantized the way it does.
function rgba(value: string): number[] | string {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(value);
  if (!m) return value;
  const a = m[4] == null ? 1 : Number(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), Number((Math.round(a * 255) / 255).toFixed(2))];
}
