/**
 * Driving the docs app from a browser: how to open a route in a known look, and
 * where the tooling hooks are.
 *
 * Two things about this app make a naive `goto` unreliable, and both are handled
 * here rather than in every spec:
 *
 *   1. The root layout renders NOTHING until the Geist faces load (a deliberate
 *      trade recorded in docs/src/app/_layout.tsx: rendering early moved Cumulative
 *      Layout Shift from 0.006 to 0.16). So "loaded" is not "painted", and the wait
 *      has to be for paint.
 *   2. The scheme, surface and palette are seeded from the LAUNCH url only (?scheme,
 *      ?surface, ?palette, read once by a lazy useState initializer in
 *      docs/src/theme/docs-theme.tsx, since the docs store nothing by privacy
 *      declaration). A client-side navigation cannot change them, and the app defaults
 *      to dark + glass (+ blush once light).
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

export type Scheme = "dark" | "light";
export type Surface = "solid" | "glass";
export type Palette = "blush" | "mint";
export type FormFactor = "phone" | "largePhone" | "tablet" | "laptop" | "desktop" | "full";

/**
 * A look the docs open in: a scheme, and for the light scheme the palette it paints.
 * Dark names no palette, since the kit paints its one dark palette whatever the link
 * says (`colorsFor` resolves it the same way). The id names a capture's directory.
 */
export interface Look {
  id: "blush" | "mint" | "dark";
  scheme: Scheme;
  palette?: Palette;
}

export const LOOKS: readonly Look[] = [
  { id: "blush", scheme: "light", palette: "blush" },
  { id: "mint", scheme: "light", palette: "mint" },
  { id: "dark", scheme: "dark" },
];

/** The prefix an EXPO_BASE_URL build is mounted under; empty for a root-served export. */
export const BASE_PATH = (process.env.E2E_BASE_PATH ?? "").replace(/\/+$/, "");

/**
 * The page backdrop, as [r, g, b]: the fill the page's content sits on.
 *
 * The docs are react-native-web, so the DOM carries only generated `css-*` class
 * names: there is no `.dark` class and no data attribute to read the scheme off.
 * Reading what the app actually paints is the only honest answer, and it has to be
 * read off the node that paints the backdrop. The largest opaque box is not that
 * node: a solid card paints the `card` token, opaque white in both light palettes,
 * and its bounds can run past the viewport on a long page, so on
 * /components/grid-lists the largest opaque box is a white card. Its luminance still
 * reads as light, which is how the scheme check got by on it; it names no palette.
 *
 * The app marks its backdrop painters (web-only tooling attributes): the Page
 * scroller (`data-page-scroll`, docs/src/ui/page.tsx), and the web shell around every
 * route (`data-shell-backdrop`, docs/src/shell/navbar.tsx), which is what is painted
 * on a route with no Page mounted yet. A painter that is fully transparent shows its
 * parent's fill exactly, so the read walks up through those; one that is translucent
 * composites with what lies under it, and that reads as no opaque backdrop rather
 * than as a guess. Only a page with neither marker, which is not the docs app (the
 * baked static page under docs/public shadows /privacy and paints straight onto
 * body), falls back to the largest opaque background, with `body` in the scan.
 *
 * Runs in the page, so it must stay self-contained.
 */
function pageBackdrop(): [number, number, number] | null {
  // [r, g, b, alpha] of a node's own background, or null for one that is not a color.
  const fill = (el: Element): [number, number, number, number] | null => {
    const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(
      getComputedStyle(el).backgroundColor,
    );
    return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
  };
  // Only an opaque surface says which scheme is being painted; the translucent scrims
  // and glass fills layered over the page fall below this.
  const OPAQUE = 0.9;
  const painter = document.querySelector("[data-page-scroll]") ?? document.querySelector("[data-shell-backdrop]");
  if (painter) {
    for (let el: Element | null = painter; el; el = el.parentElement) {
      const color = fill(el);
      if (color && color[3] === 0) continue;
      return color && color[3] >= OPAQUE ? [color[0], color[1], color[2]] : null;
    }
    return null;
  }
  let bestArea = 0;
  let best: [number, number, number] | null = null;
  for (const el of Array.from(document.querySelectorAll("body, div"))) {
    const box = el.getBoundingClientRect();
    const area = box.width * box.height;
    if (area < 20000 || area <= bestArea) continue;
    const color = fill(el);
    if (!color || color[3] < OPAQUE) continue;
    bestArea = area;
    best = [color[0], color[1], color[2]];
  }
  return best;
}

/** The page backdrop as [r, g, b], or null before an opaque one is painted. */
export async function readBackground(page: Page): Promise<[number, number, number] | null> {
  return page.evaluate(pageBackdrop).catch(() => null);
}

/** The scheme the page backdrop is painted in, or null before an opaque one is painted. */
export async function readScheme(page: Page): Promise<Scheme | null> {
  const rgb = await readBackground(page);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? "dark" : "light";
}

/** A `#rrggbb` token as the [r, g, b] a computed style reports it. */
export function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// How far, per channel, a painted background may sit from the palette's token. A
// computed style reports a hex fill exactly; the allowance is for a renderer that
// rounds a composited fill, not for a different color. The two light backdrops are
// close: blush #f5f2fe and mint #f0f7fd sit 5 apart on red and on green but only 1
// apart on blue. The check measures the LARGEST channel distance, so the 5 is what
// separates them, and the allowance stays below it.
const PALETTE_TOLERANCE = 2;

export interface GotoOptions {
  scheme?: Scheme;
  /** Solid is the default here (glass frosts are GPU-nondeterministic). */
  surface?: Surface;
  /** The light palette; blush, the kit's default, unless named. Dark paints the one dark palette whichever is named. */
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
 * The seeded look is applied one commit after hydration, so the paint check comes
 * after the marker.
 *
 * `emulateMedia` matters for exactly one page: the baked static /privacy export
 * follows prefers-color-scheme, since it is plain HTML and never sees the seed.
 *
 * In the light scheme the painted backdrop is then held to the palette's own
 * `background` token (`colorsFor`), since a light page in the wrong palette reads as
 * light all the same. That page without an app has no palette axis at all: a
 * palette asked for by name fails there rather than passing unpainted.
 */
export async function gotoDocs(page: Page, route: string, options: GotoOptions = {}): Promise<void> {
  const scheme = options.scheme ?? "dark";
  const surface = options.surface ?? "solid";
  const palette = options.palette ?? "blush";
  if (options.viewport) await page.setViewportSize(options.viewport);
  await page.emulateMedia({ colorScheme: scheme });
  const query = `scheme=${scheme}&surface=${surface}&palette=${palette}`;
  const separator = route.includes("?") ? "&" : "?";
  await page.goto(`${BASE_PATH}${route}${separator}${query}`, { waitUntil: "load" });
  // The baked /privacy page is plain HTML with no app root and nothing to hydrate.
  const app = (await page.locator("#root").count()) > 0;
  if (app) {
    await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 20_000 });
  }
  // What the poll saw decides what a failure says. A page read in the wrong look, or
  // with no opaque backdrop, has a paint problem; a page whose evaluation was still out
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
    const lastReading = `the last ${last ?? "finding no opaque backdrop"}`;
    throw new Error(
      answering
        ? `${route} never painted in ${scheme}: ${readings} readings, ${lastReading} (a missing font or a failed bundle both look like this)`
        : `${route} stopped answering: the paint check's evaluation did not return, after ${readings} readings${readings ? `, ${lastReading}` : ""}; what the page painted is unknown`,
      { cause: error },
    );
  }
  if (scheme !== "light") return;
  if (!app) {
    if (options.palette) throw new Error(`${route} is baked HTML with no app to seed a palette into, so it cannot open in ${options.palette}`);
    return;
  }
  // The palette lands in the same commit as the scheme (one transition applies the
  // whole seed), so by now the backdrop is the palette's, or it is the wrong one.
  const expected = channels(colorsFor(palette, "light").background);
  const painted = await readBackground(page);
  const distance = painted ? Math.max(...painted.map((channel, i) => Math.abs(channel - expected[i]))) : Infinity;
  if (distance > PALETTE_TOLERANCE) {
    throw new Error(
      `${route} painted in light but not in ${palette}: the backdrop is ${painted ? `rgb(${painted.join(", ")})` : "not opaque"} where ${palette}'s is rgb(${expected.join(", ")})`,
    );
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
  const box = await settledBox(frame);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("An element screenshot requires a configured viewport");
  const bannerLocator = page.getByRole("banner").first();
  const banner = await bannerLocator.count() ? await bannerLocator.boundingBox() : null;
  const scrollLocator = page.locator("[data-page-scroll]").first();
  const scrollport = await scrollLocator.count() ? await scrollLocator.boundingBox() : null;
  // The phone bottom navigation floats OVER the scrollport (the iOS 26 capsule) and can
  // be taller than the overlaid banner, so measure it directly; the docked case, where
  // the scrollport stops above the bar, still counts through the height difference.
  // Account for both rather than assuming symmetry.
  const navigationLocator = page.getByRole("navigation", { name: "Primary", exact: true }).first();
  const navigation = await navigationLocator.count() ? await navigationLocator.boundingBox() : null;
  const chrome = Math.max(scrollport ? viewport.height - scrollport.height : 0, navigation?.height ?? 0);
  const inset = Math.ceil(Math.max(banner?.height ?? 0, chrome));
  const height = Math.max(viewport.height, box.height + 2 * inset);
  if (height !== viewport.height) await page.setViewportSize({ ...viewport, height });
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
  const fitted = await settledBox(frame);
  expect(fitted.width, "the element exceeds the screenshot viewport width").toBeLessThanOrEqual(viewport.width);
  expect(fitted.height, "the element exceeds the screenshot viewport height").toBeLessThanOrEqual(height);
}
