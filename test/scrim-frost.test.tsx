import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";
import { OverlayProvider } from "../src/style/portal.tsx";
import { lightColors } from "../src/style/tokens.ts";
import { WEB_FROST } from "../src/style/glass-surface/web-frost.ts";
import * as iosScrim from "../src/style/glass-surface/scrim-frost.ios.tsx";
import * as androidScrim from "../src/style/glass-surface/scrim-frost.android.tsx";
import { Drawer } from "../src/organisms/drawer/drawer.tsx";
import { ActionSheet } from "../src/organisms/action-sheet/action-sheet.tsx";
import { Dialog } from "../src/organisms/dialog/dialog.tsx";
import { AlertDialog } from "../src/molecules/alert-dialog/alert-dialog.tsx";
import { Popover } from "../src/atoms/popover/popover.tsx";
import { hostedEntranceParts, layoutHostedEntrance } from "./entrance-layout.ts";
import { resizeViewport } from "./viewport.ts";

// The owner's GS-6 decision (audit/DECISIONS.md): under glass on the web a modal scrim also
// blurs what it dims, Dark Factory's `blur(2px)` (`WEB_FROST.scrimBlur`, the `df-frost`
// card), on every scrim the kit draws: the Drawer's (and so the Sidebar's and FilterPanel's
// drawers), the ActionSheet's, the anchored phone sheet's (a Popover at the phone form
// factor), the Dialog's and the AlertDialog's. Solid mode keeps its promise that nothing
// samples the backdrop: solid, Reduce Transparency, Increase Contrast and a browser without
// a backdrop filter render no blur and solid's markup, and the native scrims render none.
//
// The backdrop-root guard: an element with a backdrop filter is a backdrop root, and a frost
// inside it samples only what is inside it, so the blur never sits on a node that holds a
// glass material (the Dialog and AlertDialog scrims hold their card and take the blur on a
// layer of their own beneath it).
//
// The blur never samples the dim (glass-surface-scrim-self-sample-1): a backdrop filter blurs
// whatever is painted before it, so the dim and the blur are one element, as Dark Factory's
// scrim is (its background paints over its own filtered backdrop), and nothing beneath the
// blur paints the dim. A blur layer under a role node that wore the dim sampled it: a light
// fringe, up to about 22 levels a channel, at a contained scrim's rounded corners, where the
// blur pulled the undimmed page outside the curve into the dim.

afterEach(cleanup);

const BLUR = `blur(${WEB_FROST.scrimBlur}px)`;
const SCRIM = /rgba?\((\d+, \d+, \d+)/.exec(lightColors.scrim!)?.[1] ?? "";

// The browser's one material question: does it render a CSS backdrop filter?
function browserSupport(enabled: boolean) {
  const css = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", { value: { supports: () => enabled }, configurable: true });
  return () => {
    if (css) Object.defineProperty(globalThis, "CSS", css);
    else delete (globalThis as Record<string, unknown>).CSS;
  };
}

function preferences(query: "prefers-reduced-transparency" | "prefers-contrast") {
  return spyOn(window, "matchMedia").mockImplementation((media: string) => ({
    matches: media.includes(query), media, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => true,
  }) as unknown as MediaQueryList);
}

// React's ids count up across mounts; number each by its first appearance before comparing.
// Each style attribute's declarations are sorted too: under Reduce Transparency and Increase
// Contrast the provider reads the preference after its first render (glass-surface-a11y-
// first-frame-1, ThemeProvider's turn), so a glass surface mounts its material for a frame
// and then restyles, and the DOM lists a re-added declaration last. The order changes nothing
// the browser renders.
function normalized(html: string): string {
  const ids = new Map<string, string>();
  return html
    .replace(/«[^»]*»|:r[0-9a-z]+:|_r_[0-9a-z]+_/g, (id) => {
      if (!ids.has(id)) ids.set(id, `id${ids.size}`);
      return ids.get(id)!;
    })
    .replace(/style="([^"]*)"/g, (_, css: string) => `style="${css.split(/;\s*/).filter(Boolean).sort().join("; ")}"`);
}

const settle = async () => { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 30)); }); };
const all = () => Array.from(document.body.querySelectorAll("*")) as HTMLElement[];
const scrimBlurs = () => all().filter((node) => node.style.backdropFilter === BLUR);

interface Scrim { name: string; node: () => ReactNode; phone?: boolean; holdsCard: boolean }
const SCRIMS: Scrim[] = [
  { name: "Drawer", node: () => <Drawer open><Text>Drawer body</Text></Drawer>, holdsCard: false },
  { name: "ActionSheet", node: () => <ActionSheet open title="Share" actions={[{ label: "Copy link", onPress: () => {} }]} />, holdsCard: false },
  { name: "Dialog", node: () => <Dialog open title="Edit profile" description="Make changes." />, holdsCard: true },
  { name: "Dialog overlay", node: () => <Dialog open overlay title="Edit profile" description="Make changes." />, holdsCard: true },
  { name: "AlertDialog", node: () => <AlertDialog open destructive title="Delete project?" description="This cannot be undone." />, holdsCard: true },
  { name: "AlertDialog overlay", node: () => <AlertDialog open overlay destructive title="Delete project?" description="This cannot be undone." />, holdsCard: true },
  { name: "Popover phone sheet", node: () => <Popover testID="trigger" trigger="Rename" title="Rename project" description="Choose a name." />, phone: true, holdsCard: false },
];

async function open(scrim: Scrim, provider: { glass: boolean }) {
  const tree = <ThemeProvider light glass={provider.glass} solid={!provider.glass}><OverlayProvider>{scrim.node()}</OverlayProvider></ThemeProvider>;
  if (!scrim.phone) {
    render(tree);
    await settle();
    return;
  }
  // At the phone form factor a Popover that can close is presented as a sheet over a scrim.
  resizeViewport(390, 844);
  const window = { x: 0, y: 0, width: 390, height: 844 };
  const measure = spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const { x, y, width, height } = this.getAttribute("data-testid") === "trigger" ? { x: 40, y: 200, width: 120, height: 32 } : window;
    return { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height, toJSON: () => ({}) } as DOMRect;
  });
  try {
    render(tree);
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    layoutHostedEntrance(hostedEntranceParts(await screen.findByRole("dialog", { hidden: true })).content, { width: 390, height: 200 });
    await settle();
  } finally { measure.mockRestore(); }
}

async function markup(scrim: Scrim, glass: boolean): Promise<string> {
  await open(scrim, { glass });
  const html = normalized(document.body.innerHTML);
  cleanup();
  return html;
}

describe("a modal scrim blurs what it dims under glass on the web (GS-6)", () => {
  it("blurs by Dark Factory's 2 px", () => {
    expect(WEB_FROST.scrimBlur).toBe(2);
  });

  for (const scrim of SCRIMS) {
    it(`${scrim.name}: one scrim layer blurs, on the scrim, never on a node that holds a material`, async () => {
      await open(scrim, { glass: true });
      const materials = Array.from(document.body.querySelectorAll('[data-testid="glass-material"]'));
      expect(materials.length, "the modal's card frosts, so glass rendered").toBeGreaterThan(0);
      const blurs = scrimBlurs();
      expect(blurs).toHaveLength(1);
      const blur = blurs[0]!;
      // The dim and the blur are one element, whose background paints over its own blurred
      // backdrop, as Dark Factory draws its scrim.
      expect(blur.style.backgroundColor, `${scrim.name}: the blur carries the dim`).toContain(SCRIM);
      // Nothing beneath the blur paints the dim: no ancestor and no earlier sibling.
      for (let node = blur.parentElement; node; node = node.parentElement) {
        expect(node.style.backgroundColor, `${scrim.name}: an ancestor of the blur paints the dim`).not.toContain(SCRIM);
      }
      for (let node = blur.previousElementSibling; node; node = node.previousElementSibling) {
        expect((node as HTMLElement).style.backgroundColor, `${scrim.name}: a layer beneath the blur paints the dim`).not.toContain(SCRIM);
      }
      if (scrim.holdsCard) {
        // The scrim holds the card: the blur is its first child, a layer of its own with the
        // scrim's corners, and the role node wears neither the dim nor the blur.
        const role = blur.parentElement!;
        expect(["dialog", "alertdialog"]).toContain(role.getAttribute("role"));
        expect(role.firstElementChild).toBe(blur);
        expect(role.style.backdropFilter).toBe("");
        expect(blur.style.borderTopLeftRadius).toBe(role.style.borderTopLeftRadius);
        expect(blur.getAttribute("aria-hidden")).toBe("true");
        expect(blur.childElementCount).toBe(0);
        expect(blur.style.position).toBe("absolute");
        expect(blur.style.pointerEvents).toBe("none");
      } else {
        // The scrim is the card's sibling: it wears the dim and the blur itself.
        for (const material of materials) expect(blur.contains(material)).toBe(false);
      }
      // The backdrop-root guard: no node that holds a frost carries a backdrop filter itself.
      for (const material of materials) {
        for (let node = material.parentElement; node; node = node.parentElement) {
          expect(node.style.backdropFilter, `${scrim.name}: an ancestor of a material`).toBe("");
        }
      }
    });
  }
});

describe("solid keeps its promise: nothing samples the backdrop", () => {
  for (const scrim of SCRIMS) {
    it(`${scrim.name}: solid mode renders no blur`, async () => {
      await open(scrim, { glass: false });
      expect(scrimBlurs()).toHaveLength(0);
    });

    it(`${scrim.name}: glass in a browser without a backdrop filter renders solid's markup`, async () => {
      const solid = await markup(scrim, false);
      const restore = browserSupport(false);
      try {
        const glass = await markup(scrim, true);
        expect(glass).not.toContain("backdrop-filter");
        expect(glass).toBe(solid);
      } finally { restore(); }
    });

    for (const preference of ["prefers-reduced-transparency", "prefers-contrast"] as const) {
      it(`${scrim.name}: glass under ${preference} renders solid's markup under it`, async () => {
        const spy = preferences(preference);
        try {
          const solid = await markup(scrim, false);
          const glass = await markup(scrim, true);
          expect(glass).not.toContain("backdrop-filter");
          expect(glass).toBe(solid);
        } finally { spy.mockRestore(); }
      });
    }
  }
});

describe("the native scrims take no blur", () => {
  for (const [platform, module] of [["iOS", iosScrim], ["Android", androidScrim]] as const) {
    it(`${platform}: useScrimFrost is null and useHeldScrim keeps the backdrop with no layer`, () => {
      let frost: unknown = "unread";
      const backdrop = [{ borderRadius: 18, backgroundColor: lightColors.scrim }];
      let held: { style: unknown; layer: unknown } | null = null;
      function Probe() {
        frost = module.useScrimFrost();
        held = module.useHeldScrim(backdrop);
        return null;
      }
      render(<ThemeProvider light glass><Probe /></ThemeProvider>);
      expect(frost).toBeNull();
      expect(held!.style).toBe(backdrop);
      expect(held!.layer).toBeNull();
    });
  }
});
