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
 *   2. The scheme and surface are seeded from the LAUNCH url only (?scheme, ?surface,
 *      read once via a ref in docs/src/theme/docs-theme.tsx, since the docs store
 *      nothing by privacy declaration). A client-side navigation cannot change them,
 *      and the app defaults to dark + glass.
 *
 * Reading the scheme back off the painted pixels covers both at once, and it is what
 * keeps a silent no-op from passing as a capture: scripts/capture-ui.ts once seeded a
 * localStorage key no part of the docs app reads, so an entire "light" screenshot set
 * was really dark. This function fails instead.
 */
import { expect, type Locator, type Page } from "@playwright/test";

export type Scheme = "dark" | "light";
export type Surface = "solid" | "glass";
export type FormFactor = "phone" | "tablet" | "desktop";

/** The prefix an EXPO_BASE_URL build is mounted under; empty for a root-served export. */
export const BASE_PATH = (process.env.E2E_BASE_PATH ?? "").replace(/\/+$/, "");

/**
 * The largest opaque background on the page, as [r, g, b].
 *
 * The docs are react-native-web, so the DOM carries only generated `css-*` class
 * names: there is no `.dark` class and no data attribute to read the scheme off.
 * Reading what the app actually paints is the only honest answer. `body` is in the
 * scan for the one route that is not the RN app: the baked static page under
 * docs/public shadows /privacy and paints its background straight onto body.
 *
 * Runs in the page, so it must stay self-contained.
 */
function dominantBackground(): [number, number, number] | null {
  let bestArea = 0;
  let best: [number, number, number] | null = null;
  for (const el of Array.from(document.querySelectorAll("body, div"))) {
    const box = el.getBoundingClientRect();
    const area = box.width * box.height;
    if (area < 20000 || area <= bestArea) continue;
    const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(
      getComputedStyle(el).backgroundColor,
    );
    // Skip the translucent scrims and glass fills layered over the page: only an
    // opaque surface says which scheme is being painted.
    if (!m || (m[4] !== undefined && Number(m[4]) < 0.9)) continue;
    bestArea = area;
    best = [Number(m[1]), Number(m[2]), Number(m[3])];
  }
  return best;
}

/** The scheme the page is currently painting, or null before it has painted at all. */
export async function readScheme(page: Page): Promise<Scheme | null> {
  const rgb = await page.evaluate(dominantBackground).catch(() => null);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? "dark" : "light";
}

export interface GotoOptions {
  scheme?: Scheme;
  /** Solid is the default here (glass frosts are GPU-nondeterministic). */
  surface?: Surface;
  /** Resize before navigating, so the app lays out once at the target width. */
  viewport?: { width: number; height: number };
}

/**
 * Open a docs route in a known look and wait until it has painted in that look.
 *
 * `emulateMedia` matters for exactly one page: the baked static /privacy export
 * follows prefers-color-scheme, since it is plain HTML and never sees the seed.
 */
export async function gotoDocs(page: Page, route: string, options: GotoOptions = {}): Promise<void> {
  const scheme = options.scheme ?? "dark";
  const surface = options.surface ?? "solid";
  if (options.viewport) await page.setViewportSize(options.viewport);
  await page.emulateMedia({ colorScheme: scheme });
  const query = `scheme=${scheme}&surface=${surface}`;
  const separator = route.includes("?") ? "&" : "?";
  await page.goto(`${BASE_PATH}${route}${separator}${query}`, { waitUntil: "load" });
  await expect
    .poll(() => readScheme(page), {
      timeout: 20_000,
      message: `${route} never painted in ${scheme} (a missing font or a failed bundle both look like this)`,
    })
    .toBe(scheme);
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
  tablet: "Tablet width (768px)",
  desktop: "Desktop width (full)",
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
