import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { cleanup, render, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { GlassBlurTargetContext } from "../src/style/glass-surface/glass-surface.shared.tsx";
import { paneRipple } from "../src/style/glass-surface/glass-pane.tsx";
import { createCaptureTarget, type CaptureTarget } from "../src/style/glass-surface/capture-target.ts";
import * as runtime from "../src/style/glass-surface/material-runtime.ts";
import type { MaterialCapabilities } from "../src/style/glass-surface/material-resolution.ts";
import { Alert as AndroidAlert } from "../src/molecules/alert/alert.android.tsx";
import { Avatar as AndroidAvatar } from "../src/atoms/avatar/avatar.android.tsx";
import { Button as AndroidButton } from "../src/atoms/button/button.android.tsx";
import { ButtonGroup as AndroidButtonGroup } from "../src/atoms/button-group/button-group.android.tsx";
import { Checkbox as AndroidCheckbox } from "../src/atoms/checkbox/checkbox.android.tsx";
import { Chip as AndroidChip } from "../src/atoms/chip/chip.android.tsx";
import { Input as AndroidInput } from "../src/atoms/input/input.android.tsx";
import { Steps as AndroidSteps } from "../src/organisms/steps/steps.android.tsx";
import { Tabs as AndroidTabs } from "../src/organisms/tabs/tabs.android.tsx";
import { PANE_HOSTS } from "./fixtures/pane-hosts.tsx";
import { onPlatform, PLATFORM_PARTS } from "./fixtures/platform-parts.tsx";

// GP-5 (audit/foundation/glass-pane.md): on Android a Pressable's ripple is its background
// drawable, drawn before the view's children, and a GlassPane painting the Pressable's own
// surface is one of those children. Where the pane renders frost (an overlay outlet or a
// bridged Modal, which own a capture plane) it covered the ripple, and a borderless ripple,
// which Android projects onto the nearest ancestor's background, landed beneath the host
// and its pane alike: the press showed nothing (confirmed on the emulator on the Popover
// sheet's Rename Button). `paneRipple` moves the host's ripple to the foreground exactly
// where its pane renders and hands it back untouched everywhere else, so the solid tree,
// and Android's in-page glass, which resolves solid, are byte-identical.
//
// Each host renders on its Android skin three ways: solid, glass in the page (Android's
// capabilities with no capture plane, so every material resolves solid), and glass in an
// outlet (the same capabilities with a ready plane, so the frost renders). react-native-web
// drops `android_ripple`, so the ripple is read from each Pressable's own props on its
// fiber. Two rules decide which ripple must come forward, read off the rendered outlet:
// a Pressable that holds a material of its own (a pane or a surface with no nearer
// Pressable between them), and a borderless ripple inside a pane host, which is projected
// beneath that host's pane.

afterEach(cleanup);

const android: MaterialCapabilities = { platform: "android", frost: true, liquid: false, requiresTarget: true };

type Look = "solid" | "in-page" | "outlet";
type Fiber = { elementType: unknown; tag: number; stateNode: unknown; memoizedProps: Record<string, unknown> | null; child: Fiber | null; sibling: Fiber | null };
type Ripple = { color?: unknown; borderless?: unknown; radius?: unknown; foreground?: unknown } | null | undefined;
interface Press { ripple: Ripple; node: Element; props: Record<string, unknown> }

/** A page element that is the window's capture plane, attached and ready to sample. */
function readyPlane(): { plane: CaptureTarget; remove: () => void } {
  const page = document.body.appendChild(document.createElement("div"));
  const plane = createCaptureTarget();
  plane.attach(page as unknown as View);
  plane.setAvailable(page as unknown as View, true);
  return { plane, remove: () => page.remove() };
}

function renderLook(node: ReactNode, look: Look, plane: CaptureTarget): RenderResult {
  if (look === "solid") return render(<ThemeProvider light solid>{node}</ThemeProvider>);
  const placed = look === "outlet" ? <GlassBlurTargetContext.Provider value={plane.ref}>{node}</GlassBlurTargetContext.Provider> : node;
  return render(<ThemeProvider light glass>{placed}</ThemeProvider>);
}

/** The first DOM node a fiber renders. */
function hostNode(fiber: Fiber | null): Element | null {
  for (let f = fiber; f; f = f.child) if (f.tag === 5) return f.stateNode as Element;
  return null;
}

/** Every React Native Pressable under a rendered container, in tree order, with its ripple. */
function presses(container: Element): Press[] {
  const key = Object.keys(container).find((k) => k.startsWith("__reactContainer$"));
  if (!key) throw new Error("no React root on the container");
  const out: Press[] = [];
  const walk = (fiber: Fiber | null) => {
    for (let f = fiber; f; f = f.sibling) {
      if (f.elementType === Pressable) {
        const props = f.memoizedProps ?? {};
        const node = hostNode(f);
        if (node) out.push({ ripple: props.android_ripple as Ripple, node, props });
      }
      walk(f.child);
    }
  };
  // The container keeps the root fiber it was created with; its FiberRoot names the current one.
  const root = (container as unknown as Record<string, { stateNode: { current: Fiber } }>)[key]!;
  walk(root.stateNode.current.child);
  return out;
}

const materials = (root: Element) => Array.from(root.querySelectorAll('[data-testid="glass-material"]'));
/** A pane's root: the absolutely filled GlassBox behind its host's content. */
const isPane = (node: Element) => (node as HTMLElement).style?.zIndex === "-1" && node.querySelector(':scope > [data-testid="glass-material"]') != null;

/** The innermost Pressable holding a node, or null. */
function owner(node: Element, all: Press[]): Press | null {
  let best: Press | null = null;
  for (const press of all) if (press.node.contains(node) && (best == null || best.node.contains(press.node))) best = press;
  return best;
}

/** Which Pressables of a rendered outlet a pane would hide the press of. */
function hiddenBehindAPane(container: Element, all: Press[]): Set<Press> {
  const out = new Set<Press>();
  // A material of the Pressable's own: a pane, or a surface it paints inside itself.
  for (const material of materials(container)) {
    const press = owner(material, all);
    if (press?.ripple != null) out.add(press);
  }
  // A borderless ripple inside a pane host, projected beneath the host's pane.
  const hosts = Array.from(container.querySelectorAll("*")).filter(isPane).map((pane) => pane.parentElement!);
  for (const press of all) {
    if (press.ripple?.borderless === true && hosts.some((host) => host !== press.node && host.contains(press.node))) out.add(press);
  }
  return out;
}

// A row whose indicator is a pane of its own (the Android FilterPanel's checkbox visual, a
// decorative Checkbox inside the option row): the indicator covers the row's ripple only in
// its own 18 dp box, as its solid fill does once checked. The row's surface is not a pane,
// so its ripple stays in the background.
const INDICATOR_ROW = (host: string, press: Press) => host === "FilterPanel" && press.props.accessibilityRole === "checkbox";

const json = (ripple: Ripple) => JSON.stringify(ripple ?? null);

async function holdsPressFeedback(name: string, node: ReactNode) {
  const { plane, remove } = readyPlane();
  const capabilities = spyOn(runtime, "useMaterialCapabilities").mockReturnValue(android);
  try {
    const looks = {} as Record<Look, { container: Element; all: Press[] }>;
    for (const look of ["solid", "in-page", "outlet"] as const) {
      const result = renderLook(node, look, plane);
      // The frost resolves once the plane is read: wait a tick for the outlet's materials.
      if (look === "outlet") await new Promise((resolve) => setTimeout(resolve, 10));
      looks[look] = { container: result.container, all: presses(result.container) };
    }
    const solid = looks.solid.all;
    // In the page Android's glass resolves solid: every ripple is solid's, byte for byte, and
    // none comes forward.
    expect(looks["in-page"].all.map((press) => json(press.ripple)), `${name}: in-page glass`).toEqual(solid.map((press) => json(press.ripple)));
    for (const press of solid) expect(press.ripple?.foreground, `${name}: a solid ripple stays in the background`).toBeUndefined();
    // In an outlet the frost renders: a ripple a pane would hide comes forward, the rest is solid's.
    const outlet = looks.outlet.all;
    expect(outlet.length, `${name}: the same Pressables`).toBe(solid.length);
    const hidden = hiddenBehindAPane(looks.outlet.container, outlet);
    outlet.forEach((press, i) => {
      const forward = hidden.has(press) && !INDICATOR_ROW(name, press);
      const expected = forward ? { ...solid[i]!.ripple, foreground: true } : solid[i]!.ripple;
      expect(json(press.ripple), `${name}: Pressable ${i} (${String(press.props.accessibilityLabel ?? press.props.accessibilityRole ?? "")})`).toBe(json(expected));
    });
    return { forward: outlet.filter((press) => hidden.has(press) && !INDICATOR_ROW(name, press)).length };
  } finally {
    capabilities.mockRestore();
    remove();
  }
}

describe("paneRipple", () => {
  const ripple = { color: "rgba(0, 0, 0, 0.10)", borderless: false };

  it("brings the ripple forward where the pane renders", () => {
    expect(paneRipple(true, ripple)).toEqual({ ...ripple, foreground: true });
    expect(paneRipple(true, { ...ripple, borderless: true, radius: 20 })).toEqual({ ...ripple, borderless: true, radius: 20, foreground: true });
  });

  it("hands the config back untouched where it does not, and passes no ripple through", () => {
    expect(paneRipple(false, ripple)).toBe(ripple);
    expect(paneRipple(true, undefined)).toBeUndefined();
    expect(paneRipple(true, null)).toBeNull();
  });
});

describe("on Android a pane host's press shows over its pane", () => {
  // Every pane host in the shared list, on its Android skin.
  for (const host of PANE_HOSTS) {
    const node = onPlatform(host.node, PLATFORM_PARTS.android);
    it(host.name, () => holdsPressFeedback(host.name, node));
  }

  // The pane hosts' pressable states the shared list does not render, each named with the
  // Pressables that must bring their ripple forward in an outlet.
  const PRESSES: { name: string; node: ReactNode; forward: number }[] = [
    { name: "Button: primary and secondary pucks", node: <><AndroidButton primary>Save</AndroidButton><AndroidButton secondary>Cancel</AndroidButton><AndroidButton ghost>Skip</AndroidButton></>, forward: 2 },
    { name: "Chip: a tappable filter", node: <><AndroidChip onPress={() => {}}>Filter</AndroidChip><AndroidChip selectable defaultSelected>Picked</AndroidChip></>, forward: 2 },
    { name: "Checkbox: the indeterminate box", node: <AndroidCheckbox indeterminate>Some</AndroidCheckbox>, forward: 1 },
    { name: "Steps: the pressable completed and current discs", node: <AndroidSteps steps={[{ label: "Account" }, { label: "Profile" }]} defaultCurrent={1} onStepPress={() => {}} />, forward: 2 },
    { name: "Alert: the dismiss button's borderless ripple", node: <AndroidAlert title="Saved" dismissible />, forward: 1 },
    { name: "Input: the clear and reveal buttons", node: <><AndroidInput label="Search" clearable defaultValue="canvas" /><AndroidInput label="Password" secureTextEntry passwordToggle /></>, forward: 2 },
    { name: "Avatar: a pressable tile", node: <AndroidAvatar onPress={() => {}} accessibilityLabel="Account" />, forward: 1 },
    { name: "ButtonGroup: spaced peers", node: <AndroidButtonGroup spaced items={["Day", "Week"]} />, forward: 2 },
    { name: "Tabs: the selected pill and vertical trigger", node: <><AndroidTabs pills tabs={["General", "Security"]} /><AndroidTabs vertical tabs={["General", "Security"]} /></>, forward: 2 },
  ];
  for (const { name, node, forward } of PRESSES) {
    it(name, async () => {
      const result = await holdsPressFeedback(name, node);
      expect(result.forward, `${name}: Pressables brought forward`).toBe(forward);
    });
  }
});
