/**
 * Driving the docs app from a browser: how to open a route in a known look, and
 * where the tooling hooks are.
 *
 * Two things about this app make a naive `goto` unreliable, and both are handled
 * here rather than in every spec:
 *
 *   1. The root layout renders NOTHING until the docs' faces load (a deliberate
 *      trade recorded in docs/src/app/_layout.tsx: rendering early moved Cumulative
 *      Layout Shift from 0.006 to 0.16). So "loaded" is not "painted", and the wait
 *      has to be for paint.
 *   2. The scheme, surface and palette are seeded from the LAUNCH url only (?scheme,
 *      ?surface, ?palette, read once by a lazy useState initializer in
 *      docs/src/theme/docs-theme.tsx, since the docs store nothing by privacy
 *      declaration). A client-side navigation cannot change them, and the app defaults
 *      to dark + glass in violet.
 *
 * Reading the scheme and the palette back off the painted pixels covers both at once,
 * and it is what keeps a silent no-op from passing as a capture: the screenshot script
 * this suite replaced once seeded a localStorage key no part of the docs app reads (it
 * belongs to the kit's web CSS hand-off, which the docs do not use), so an entire
 * "light" screenshot set was really dark and nothing said so. This function fails
 * instead.
 */
import { expect, type Locator, type Page } from "@playwright/test";
import { colorsFor } from "../../src/style/tokens.ts";
import { pageColor } from "../../docs/src/shell/page-look.ts";

export type Scheme = "dark" | "light";
export type Surface = "solid" | "glass";
export type Palette = "violet" | "cyan" | "mint" | "rose" | "amber";
export type FormFactor = "phone" | "largePhone" | "tablet" | "laptop" | "desktop" | "full";

/**
 * A look the docs open in: a scheme, and the accent palette it paints (violet, the kit's
 * default, unless named). The id names a capture's directory.
 */
export interface Look {
  id: "light" | "mint" | "dark";
  scheme: Scheme;
  palette?: Palette;
}

export const LOOKS: readonly Look[] = [
  { id: "light", scheme: "light", palette: "violet" },
  { id: "mint", scheme: "light", palette: "mint" },
  { id: "dark", scheme: "dark" },
];

/**
 * The instant every picture is taken at. Several examples render today's date or a
 * live-looking clock, so a capture pins `page.clock` to this before it navigates and the
 * same example is the same picture tomorrow.
 */
export const FIXED_TIME = new Date("2026-01-15T12:00:00Z");

/** The prefix an EXPO_BASE_URL build is mounted under; empty for a root-served export. */
export const BASE_PATH = (process.env.E2E_BASE_PATH ?? "").replace(/\/+$/, "");

/**
 * The page as painted, [r, g, b], and the accent the app's theme resolved.
 *
 * The docs are react-native-web, so the DOM carries only generated `css-*` class
 * names: there is no `.dark` class to read the scheme off. Reading what the app
 * actually paints is the only honest answer, and it has to be read off the node that
 * paints the page: the backdrop (docs/src/shell/page-backdrop.tsx), the v4 hand-off's
 * flat page fixed behind the shell, under its marker (`data-page-backdrop`). The largest
 * opaque box is not that node: a solid card paints the `card` token, and its bounds can
 * run past the viewport on a long page.
 *
 * The flat page is the scheme's `background` in every palette, so the palette is read
 * off the same node's `data-accent`, the `primary` token the kit's ThemeProvider handed
 * the docs (the colour every primary control paints).
 *
 * Only a page with no backdrop, which is not the docs app (the baked static page under
 * docs/public shadows /privacy and paints straight onto body), falls back to the largest
 * opaque background, with `body` in the scan, and reports no accent.
 *
 * Runs in the page, so it must stay self-contained.
 */
function pageLook(): { page: [number, number, number]; accent: string | null } | null {
  const parse = (value: string): [number, number, number, number] | null => {
    const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(value);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
  };
  const backdrop = document.querySelector<HTMLElement>("[data-page-backdrop]");
  if (backdrop) {
    const color = parse(getComputedStyle(backdrop).backgroundColor);
    if (!color || color[3] < 1) return null;
    return { page: [color[0], color[1], color[2]], accent: backdrop.dataset.accent ?? null };
  }
  // Only an opaque surface says which scheme is being painted; the translucent scrims
  // and glass fills layered over the page fall below this.
  const OPAQUE = 0.9;
  let bestArea = 0;
  let best: [number, number, number] | null = null;
  for (const el of Array.from(document.querySelectorAll("body, div"))) {
    const box = el.getBoundingClientRect();
    const area = box.width * box.height;
    if (area < 20000 || area <= bestArea) continue;
    const color = parse(getComputedStyle(el).backgroundColor);
    if (!color || color[3] < OPAQUE) continue;
    bestArea = area;
    best = [color[0], color[1], color[2]];
  }
  return best ? { page: best, accent: null } : null;
}

/** The painted page colour as [r, g, b], or null before the page is painted. */
export async function readPageLook(page: Page): Promise<[number, number, number] | null> {
  const look = await page.evaluate(pageLook).catch(() => null);
  return look?.page ?? null;
}

/** The accent the docs' theme resolved (its `primary` token, lowercase hex), or null before the app paints. */
export async function readAccent(page: Page): Promise<string | null> {
  const look = await page.evaluate(pageLook).catch(() => null);
  return look?.accent?.toLowerCase() ?? null;
}

/** The scheme the page is painted in, or null before it is painted: the page colour's luminance. */
export async function readScheme(page: Page): Promise<Scheme | null> {
  const color = await readPageLook(page);
  if (!color) return null;
  const [r, g, b] = color;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? "dark" : "light";
}

/** The page colour a scheme paints, as [r, g, b]: the same in every palette. */
export function pageChannels(scheme: Scheme): [number, number, number] {
  return channels(pageColor(colorsFor("violet", scheme)));
}

/** The accent a palette resolves to in a scheme, as `readAccent` reports it. */
export function accentOf(scheme: Scheme, palette: Palette): string {
  return colorsFor(palette, scheme).primary.toLowerCase();
}

/** A `#rrggbb` token as the [r, g, b] a computed style reports it. */
export function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export interface GotoOptions {
  scheme?: Scheme;
  /** Solid is the default here (glass frosts are GPU-nondeterministic). */
  surface?: Surface;
  /** The accent palette; violet, the kit's default, unless named. */
  palette?: Palette;
  /** Resize before navigating, so the app lays out once at the target width. */
  viewport?: { width: number; height: number };
}

/**
 * Open a docs route in a known look and wait until it is live and has painted in
 * that look.
 *
 * Every page is pre-rendered, so it paints (in the server's dark glass) before its
 * bundle has run; the app marks the document `data-hydrated` once React has taken
 * over (docs/src/ui/docs-head.tsx), and that is the moment a click means anything.
 * The seeded look lands later, in a transition after hydration (so a lazy page can
 * finish hydrating its Suspense boundary first), and the app marks the look it has
 * committed as `data-look` (DocsLookMarker: its scheme, surface and palette). The
 * paint check alone cannot stand in for that marker: the server's dark glass already
 * reads as dark, so a dark run used to return while the page still showed the
 * server's glass and its measured layout had not settled, and the a11y scans of
 * Deploy 37895747440 caught a code block's scroller there before its keyboard stop
 * was measured. So the wait is for the marker, then for the paint.
 *
 * `emulateMedia` matters for exactly one page: the baked static /privacy export
 * follows prefers-color-scheme, since it is plain HTML and never sees the seed.
 *
 * The resolved accent is then held to the palette's own `primary`, in either scheme,
 * since the flat page reads the same in every palette. The page without an app has no
 * palette axis at all: a palette asked for by name fails there rather than passing
 * unpainted.
 */
export async function gotoDocs(page: Page, route: string, options: GotoOptions = {}): Promise<void> {
  const scheme = options.scheme ?? "dark";
  const surface = options.surface ?? "solid";
  const palette = options.palette ?? "violet";
  if (options.viewport) await page.setViewportSize(options.viewport);
  await page.emulateMedia({ colorScheme: scheme });
  const query = `scheme=${scheme}&surface=${surface}&palette=${palette}`;
  const separator = route.includes("?") ? "&" : "?";
  await page.goto(`${BASE_PATH}${route}${separator}${query}`, { waitUntil: "load" });
  // The baked /privacy page is plain HTML with no app root and nothing to hydrate.
  const app = (await page.locator("#root").count()) > 0;
  if (app) {
    await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 20_000 });
    await page.locator(`html[data-look="${scheme} ${surface} ${palette}"]`).waitFor({ state: "attached", timeout: 20_000 });
  }
  // What the poll saw decides what a failure says. A page read in the wrong look, or
  // with no page look painted, has a paint problem; a page whose evaluation was still out
  // when the wait ran out stopped answering, whatever it painted. Blaming the paint for
  // the second sent the first look at a Firefox failure (Deploy 36101320198) after a
  // cause the trace ruled out: that page was painted dark, and the detector's first
  // evaluation was the call that never came back.
  let readings = 0;
  let last: Scheme | null = null;
  let answering = true;
  try {
    await expect
      .poll(async () => {
        answering = false;
        last = await readScheme(page);
        answering = true;
        readings += 1;
        return last;
      }, { timeout: 20_000 })
      .toBe(scheme);
  } catch (error) {
    const lastReading = `the last ${last ?? "finding no page look painted"}`;
    throw new Error(
      answering
        ? `${route} never painted in ${scheme}: ${readings} readings, ${lastReading} (a missing font or a failed bundle both look like this)`
        : `${route} stopped answering: the paint check's evaluation did not return, after ${readings} readings${readings ? `, ${lastReading}` : ""}; what the page painted is unknown`,
      { cause: error },
    );
  }
  if (!app) {
    if (options.palette) throw new Error(`${route} is baked HTML with no app to seed a palette into, so it cannot open in ${options.palette}`);
    return;
  }
  // The palette lands in the same commit as the scheme (one transition applies the
  // whole seed), so by now the accent is the palette's, or it is the wrong one.
  const expected = accentOf(scheme, palette);
  const accent = await readAccent(page);
  if (accent !== expected) {
    throw new Error(`${route} painted in ${scheme} but not in ${palette}: the accent is ${accent ?? "not reported"} where ${palette}'s is ${expected}`);
  }
}

/**
 * The Playground stage: the platform rows, the form-factor switcher and the code
 * block, plus the outlet an opened overlay portals into.
 *
 * Filtered by the preview card because docs/src/ui/dont.tsx stamps the same
 * data-preview-stage attribute on every Do/Don't frame, and only the Playground's
 * stage contains a preview card.
 */
export function stage(page: Page): Locator {
  return page.locator("[data-preview-stage]").filter({ has: page.locator("[data-preview-card]") });
}

/** The preview card: the three platform rows, without the switcher row or the code block. */
export function previewCard(page: Page): Locator {
  return page.locator("[data-preview-card]");
}

/** One platform's row inside the preview card. */
export function platformRow(page: Page, platform: "ios" | "android" | "web"): Locator {
  return page.locator(`[data-platform-row="${platform}"]`);
}

/**
 * Whether a docs path is a component page, every one of which is the v4 detail page
 * (docs/src/ui/detail). That page has no example rail: its comparison stage is the
 * Platform skins section, whose preview card names the example it shows in
 * `data-example`, and a "Platform example" picker moves between the examples.
 */
export function isDetailPath(path: string): boolean {
  const slug = /^\/components\/([^/?#]+)/.exec(path.replace(BASE_PATH, ""))?.[1];
  return slug != null;
}

/** The preview card showing one example, by its label (the v4 detail page). */
export function exampleCard(page: Page, label: string): Locator {
  return page.locator(`[data-preview-card][data-example="${label.replace(/"/g, '\\"')}"]`);
}

/**
 * Show one example on the page's comparison stage: the rail tab on the Playground page,
 * the "Platform example" picker on the v4 detail page. Either rewrites the address to the
 * example's variant route.
 */
export async function selectExample(page: Page, label: string): Promise<void> {
  if (isDetailPath(new URL(page.url()).pathname)) {
    await page.getByRole("button", { name: "Platform example", exact: true }).click();
    // The selected option's name carries the Select's checkmark glyph ("✓ Default").
    const name = new RegExp(`^(✓ )?${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
    await page.getByRole("option", { name }).click();
    await expect(exampleCard(page, label)).toHaveCount(1);
    return;
  }
  const tab = page.getByTestId("playground-examples").getByRole("tab", { name: label, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

const FORM_FACTOR_LABEL: Record<FormFactor, string> = {
  phone: "Phone width (375px)",
  largePhone: "Large phone width (640px)",
  tablet: "Tablet width (768px)",
  laptop: "Laptop width (1024px)",
  desktop: "Desktop width (1280px)",
  full: "Full width",
};

/**
 * Click the docs' own form-factor switcher, which clamps the preview card AND pins
 * the kit's viewport bucket (BreakpointOverride) so components measure as they would
 * on that tier. Web-only, and absent when the page has a single example.
 */
export async function setFormFactor(page: Page, factor: FormFactor): Promise<void> {
  const group = page.getByRole("tablist", { name: "Preview form factor" });
  const tab = group.getByRole("tab", { name: FORM_FACTOR_LABEL[factor] });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

/**
 * Read a measurement until it stops changing.
 *
 * Several components size themselves from a measurement of their own box, and an
 * overlay's container grows AFTER the overlay becomes visible, so a single sample
 * races the layout. Agreeing samples across `holdMs` is a wait on the settled state
 * rather than on a clock, and it is direction-agnostic: a value that is genuinely
 * wrong settles too, and fails on the real number.
 *
 * This is not a nicety. Sampling the page's overflow once produced a test that failed
 * under parallel workers and passed alone; sampling an overlay's stage height once
 * produced a screenshot baseline of a stage that had not finished opening. And two
 * samples 50 ms apart were not enough either: a pre-rendered page paints its static
 * markup, hydrates, and only then delivers the container measurements its grids and
 * charts lay out from, one animation frame after another, so on a loaded runner the
 * DashboardGrid's preview card read 900 px twice, was fitted, and stood at 1,801 px by
 * the capture. The value now has to hold for the whole window.
 */
export async function settled<T>(read: () => Promise<T>, timeoutMs = 5_000, holdMs = 250): Promise<T> {
  let previous = await read();
  let heldSince = Date.now();
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const current = await read();
    const now = Date.now();
    if (JSON.stringify(current) !== JSON.stringify(previous)) {
      previous = current;
      heldSince = now;
    } else if (now - heldSince >= holdMs) return current;
    if (now > deadline) return current;
  }
}

/**
 * Wait for `count` animation frames the browser really runs.
 *
 * The page's own requestAnimationFrame cannot promise that in the visual specs:
 * `page.clock` (they pin the date with it) replaces it with a timer that fires
 * whether or not a frame is drawn. An isolated world keeps the browser's own, so the
 * wait runs there, through the DevTools protocol, which makes it Chromium only (every
 * spec that waits on frames here runs in a Chromium project).
 *
 * Bounded: a browser that runs no frame for `timeoutMs` has a stalled frame pipeline,
 * and that fails here, by name, rather than as an anonymous test timeout further on.
 */
export async function animationFrames(page: Page, count: number, timeoutMs = 15_000): Promise<void> {
  const browser = page.context().browser()?.browserType().name();
  if (browser !== "chromium") throw new Error(`animationFrames needs Chromium's DevTools protocol, not ${browser}`);
  const session = await page.context().newCDPSession(page);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stalled = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(
      `the browser ran fewer than ${count} animation frames in ${timeoutMs} ms: its frame pipeline has stalled`,
    )), timeoutMs);
  });
  try {
    await Promise.race([stalled, (async () => {
      const { frameTree } = await session.send("Page.getFrameTree");
      const { executionContextId } = await session.send("Page.createIsolatedWorld", {
        frameId: frameTree.frame.id,
        worldName: "e2e-animation-frames",
      });
      await session.send("Runtime.evaluate", {
        contextId: executionContextId,
        expression: `new Promise((resolve) => {
          let left = ${count};
          const tick = () => (--left > 0 ? requestAnimationFrame(tick) : resolve(true));
          requestAnimationFrame(tick);
        })`,
        awaitPromise: true,
      });
    })()]);
  } finally {
    clearTimeout(timer);
    // Not awaited: a stalled renderer may never acknowledge the detach.
    void session.detach().catch(() => {});
  }
}

/**
 * The box of a locator, once it has stopped moving. Two animation frames pass
 * before the first sample: react-native-web reports a layout through a resize
 * observer on the frame after the commit, and a measured component re-renders from
 * it on the next, so a sample taken straight after hydration reads the pre-rendered
 * markup, not the laid-out component.
 */
export async function settledBox(locator: Locator): Promise<{ width: number; height: number }> {
  await animationFrames(locator.page(), 2);
  return settled(async () => {
    const box = await locator.boundingBox();
    return { width: Math.round(box?.width ?? -1), height: Math.round(box?.height ?? -1) };
  });
}

/**
 * Fit a preview card or opened stage inside the viewport before cropping it.
 *
 * Chromium captures an element taller than its viewport with captureBeyondViewport.
 * That can emit a temporary 1x1 visualViewport resize, which RNW treats as a real
 * responsive layout change. Grow only the viewport height from the measured element,
 * leaving enough room above and below for the docs' floating navigation bar.
 * Document-root Modal screenshots keep their configured viewport instead.
 */
export async function fitElementForScreenshot(page: Page, frame: Locator): Promise<void> {
  let box = await settledBox(frame);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("An element screenshot requires a configured viewport");
  const bannerLocator = page.getByRole("banner").first();
  const banner = await bannerLocator.count() ? await bannerLocator.boundingBox() : null;
  const scrollLocator = page.locator("[data-page-scroll]").first();
  const scrollport = await scrollLocator.count() ? await scrollLocator.boundingBox() : null;
  // The pill navbar (the Primary navigation) floats OVER the scrollport inside the
  // banner; measure it directly too, and the docked case, where the scrollport stops
  // short of the window, through the height difference. Account for both rather than
  // assuming symmetry.
  const navigationLocator = page.getByRole("navigation", { name: "Primary", exact: true }).first();
  const navigation = await navigationLocator.count() ? await navigationLocator.boundingBox() : null;
  const chrome = Math.max(scrollport ? viewport.height - scrollport.height : 0, navigation?.height ?? 0);
  const inset = Math.ceil(Math.max(banner?.height ?? 0, chrome));
  // A measured component lays out in stages (a container measures, then the components it
  // sizes measure themselves: a DashboardGrid's cells, then each chart frame inside them), so
  // the element can still grow after the first settled sample. Fit again from the grown box
  // until the viewport holds it.
  let height = viewport.height;
  let fitted = box;
  for (let round = 0; round < 3; round++) {
    height = Math.max(height, box.height + 2 * inset);
    if (height !== page.viewportSize()?.height) await page.setViewportSize({ ...viewport, height });
    // A preceding element capture may leave the card just beneath a fixed banner.
    // Center explicitly, since scrollIntoViewIfNeeded ignores that occluding bar.
    await frame.evaluate((node) => node.scrollIntoView({ block: "center", inline: "nearest" }));
    if (scrollport && banner) {
      // Centering is relative to the nested scrollport, whose top can sit behind
      // the banner. Align against the measured exposed edge of that scrollport.
      await frame.evaluate((node, top) => {
        const scroller = node.closest<HTMLElement>("[data-page-scroll]");
        if (scroller) scroller.scrollTop += node.getBoundingClientRect().top - top;
      }, Math.max(scrollport.y, banner.y + banner.height));
    }
    fitted = await settledBox(frame);
    if (fitted.height + 2 * inset <= height) break;
    box = fitted;
  }
  expect(fitted.width, "the element exceeds the screenshot viewport width").toBeLessThanOrEqual(viewport.width);
  expect(fitted.height, "the element exceeds the screenshot viewport height").toBeLessThanOrEqual(height);
}
