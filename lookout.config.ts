/**
 * lookout config for the Canvas docs (https://github.com/ionizeio/lookout).
 *
 * Targets the running docs app (bun run dev in docs/, Metro on 8081) and derives
 * the component routes from nav.config.json, which check-nav-sync holds 1:1 with
 * the docs core, so this list cannot drift out from under the sweep.
 *
 * Solid remains the canonical pixel baseline. The separate glass pass covers
 * every route in the maintained material manifest, including inherited surfaces
 * whose unpainted anatomy must survive the theme change. Scheme switches use launch-URL seeding
 * (?scheme=dark|light), which also powers native light capture
 * (canvas:///components/button?scheme=light).
 *
 * Type-only imports: erased at runtime (bun executes this file directly), so
 * nothing here requires @nannier-com/lookout to be installed in canvas.
 */
import type { LookoutConfig, RouteDef, StateRecipe } from "@nannier-com/lookout";
import type { Page } from "playwright";
import navConfig from "./docs/src/data/nav.config.json";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "./e2e/support/overlay-recipes.ts";
import { MATERIAL_ROUTES, nativeMaterialRoutes, nativeMaterialTarget } from "./e2e/support/material-routes.ts";
import { fitElementForScreenshot } from "./e2e/support/docs.ts";
import { existsSync } from "node:fs";

// ---------------------------------------------------------------------------
// Routes: every component page, element-shot on the preview card (the 3-up
// platform rows without the switcher row or code block; data-preview-card is
// the docs' tooling hook). Overlay-bearing routes add an open-state recipe.
// ---------------------------------------------------------------------------

const sidebar = (navConfig as {
  web: { sidebar: { base?: string; components?: { slug: string }[] }[] };
}).web.sidebar;

/** Overlay routes and the state that opens them (see states below). */
const OVERLAY_STATE: Record<string, string> = {
  ...Object.fromEntries(MATERIAL_OVERLAY_RECIPES.map(({ slug }) => [slug, `open-${slug}`])),
  toast: "show-toast",
};

// Each sidebar group carries the path base its entries live under (/components,
// /templates, /patterns); a component can appear in more than one group, so a path is
// captured once. Only the component reference renders the preview card: the template
// and pattern pages (MockupDocPage) are shot full-page and open no overlay.
const seenPaths = new Set<string>();
const componentRoutes: RouteDef[] = sidebar.flatMap((group) =>
  (group.components ?? []).flatMap((c): RouteDef[] => {
    const base = group.base ?? "/components";
    const path = `${base}/${c.slug}`;
    if (seenPaths.has(path)) return [];
    seenPaths.add(path);
    if (base !== "/components") return [{ path, name: `${base.slice(1)}/${c.slug}` }];
    return [
      {
        path,
        name: c.slug,
        element: "[data-preview-card]",
        states: OVERLAY_STATE[c.slug] ? [OVERLAY_STATE[c.slug]!] : [],
      },
    ];
  }),
);

// ---------------------------------------------------------------------------
// Overlay recipes. The list itself lives in e2e/support/overlay-recipes.ts, shared
// with the end-to-end suite, because keeping two copies is what let four of these go
// stale unnoticed: Select was opened by the text of its current value, which stopped
// matching when the example changed, so the sweep judged a closed Select as an open
// one. Here they are wrapped as lookout StateRecipes: a settle pause after the click,
// Escape to restore, and element:null so the shot is the full page, since an open
// overlay portals OUTSIDE the preview card: to the stage-level outlet, or, for an
// anchored card that closes on an outside tap, to the app root's outlet.
// ---------------------------------------------------------------------------

const stage = (page: Page) => page.locator("[data-preview-stage]").filter({ has: page.locator("[data-preview-card]") }).first();

const states: Record<string, StateRecipe> = Object.fromEntries(
  MATERIAL_OVERLAY_RECIPES.map((recipe) => [
    OVERLAY_STATE[recipe.slug],
    {
      prepare: async (page: Page) => {
        await recipe.open(page, stage(page));
        const host = recipe.atDocumentRoot || recipe.inWindowLayer ? page : stage(page).locator("..");
        await host.getByRole(recipe.role).last().waitFor({ state: "visible" });
      },
      restore: async (page: Page) => {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);
      },
      element: null,
    } satisfies StateRecipe,
  ]),
);

// Keep the fixed-viewport rest shot and add complete component evidence. Tall
// preview cards live inside a docs scrollport, so Chromium cannot paint their
// offscreen rows merely by requesting an element crop beyond the viewport.
const contentViewports = new WeakMap<Page, { width: number; height: number }>();
states["full-content"] = {
  description: "Complete preview at the same width, with viewport height fitted to the content",
  prepare: async (page: Page) => {
    const viewport = page.viewportSize();
    if (viewport) contentViewports.set(page, viewport);
    await fitElementForScreenshot(page, page.locator("[data-preview-card]").first());
  },
  restore: async (page: Page) => {
    const viewport = contentViewports.get(page);
    if (viewport) await page.setViewportSize(viewport);
    contentViewports.delete(page);
  },
  element: "[data-preview-card]",
};

// Toasts auto-dismiss, so they are shot right after the trigger with no restore. The
// live region is already on the page and empty; the trigger fills it.
states[OVERLAY_STATE.toast] = {
  prepare: async (page: Page) => {
    await TOAST_RECIPE.open(page, stage(page));
    await page.waitForTimeout(350);
  },
  element: null,
};

// Keep the lifted material visible in regression evidence. The selection must
// extend beyond its track without stretching labels or clipping nearby rows.
states["button-group-held"] = {
  prepare: async (page: Page) => {
    // Lookout normally requests Reduce Motion. This state explicitly verifies
    // the interactive lift; the rest capture still checks the reduced version.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await stage(page).getByRole("tab", { name: "Week", exact: true }).first().hover();
    await page.mouse.down();
    await page.waitForTimeout(400);
  },
  restore: async (page: Page) => {
    await page.mouse.up();
    await page.emulateMedia({ reducedMotion: "reduce" });
  },
  element: "[data-preview-card]",
};

// ---------------------------------------------------------------------------
// The v4 hand-off parity pass (target "v4"). Every docs page the hand-off draws is shot
// whole at 1440 in the hand-off's default look (dark, glass, violet) and judged one to one
// against its reference image in .v4-reference/dark (tools/v4/capture-references.ts
// photographs the vendored hand-off, tools/v4/handoff). The owner's rule (2026-10-28): the
// docs and the kit match the hand-off pixel for pixel, dimensions and responsiveness
// included, so every divergence is a finding unless the never-file list settles it.
//
// A component page is judged twice. Whole (components/<slug>.png) it answers for presence
// and order: which sections the page has and in what sequence. A whole page is too tall for
// the judge to see a fine difference, so geometry and finish are judged per section: one
// route per (component, section), cropped to the docs' [data-detail-section=<id>] marker and
// held against the hand-off's crop of the same section, components/<slug>/<id>.png (cut by
// the same script). The ids, in page order: header, pg, var, sz, st, an, props, a11y, pf,
// use, tok, prevnext (V4_SECTIONS, below).
// ---------------------------------------------------------------------------

const REFERENCE = "./.v4-reference/dark";
const reference = (file: string) => (existsSync(`${REFERENCE}/${file}`) ? `${REFERENCE}/${file}` : undefined);

// The docs scroll an inner view ([data-page-scroll]), not the window, so a full-page
// screenshot shows one window's worth. The whole page is photographed by growing the
// window to the scroller's content, as the hand-off's reference pages are whole pages.
// Chromium paints nothing past 16384 device pixels; the v4 target shoots at device scale 1
// (its references are scale 1, `deviceScaleFactor` below), so the window may grow to 16000
// CSS px and every page the hand-off draws fits. (The 2026-10-28 Button run, at scale 2,
// grew the window to 11723 and the shot went blank past 8192.)
const WHOLE_PAGE_MAX = 16000;
const pageViewports = new WeakMap<Page, { width: number; height: number }>();
states["whole-page"] = {
  description: "The whole page at the same width, the window grown to the page's content",
  prepare: async (page: Page) => {
    const viewport = page.viewportSize();
    if (!viewport) return;
    pageViewports.set(page, viewport);
    const height = await page.locator("[data-page-scroll]").first().evaluate((node) => node.scrollHeight);
    await page.setViewportSize({ width: viewport.width, height: Math.min(Math.max(height, viewport.height), WHOLE_PAGE_MAX) });
    await page.waitForTimeout(1500);
  },
  restore: async (page: Page) => {
    const viewport = pageViewports.get(page);
    if (viewport) await page.setViewportSize(viewport);
    pageViewports.delete(page);
  },
  element: null,
};

// The sections of a component detail page, in page order. The ids are shared by the
// reference crops (components/<slug>/<id>.png) and the docs' data-detail-section markers
// (web only). Each maps to one part of the hand-off's component page:
//   header    the page <header>: crumbs, title, lead and links
//   pg        #cv-pg, Playground
//   var       #cv-var, Variants
//   sz        #cv-sz, Sizes
//   st        #cv-st, States
//   an        #cv-an, Anatomy
//   props     #cv-props, Props
//   a11y      #cv-a11y, Accessibility and keyboard
//   pf        #cv-pf, Platform skins
//   use       #cv-use, Usage
//   tok       #cv-tok, Tokens and related
//   prevnext  the previous/next grid after Tokens
const V4_SECTIONS = ["header", "pg", "var", "sz", "st", "an", "props", "a11y", "pf", "use", "tok", "prevnext"] as const;

// One fit state per section. A StateRecipe is not handed its route, so a state cannot read
// which section the route names; each id gets its own. Like whole-page, it grows the window
// (the docs scroll an inner view, so a section below the first window is not painted
// otherwise), here to hold one section: fitElementForScreenshot scrolls the section clear of
// the floating navbar and grows the height to fit it, and restore puts the window back.
// The navbar pill floats over the scroller, so a section scrolled to the top of the window
// is photographed with the pill across it (the 2026-10-28 Button run filed the pill's
// clipped left end and the text under it as defects of the section); the state hides the
// banner for the shot, as tools/v4/capture-references.ts hides the hand-off's nav for its
// section crops, and restore shows it again.
const sectionViewports = new WeakMap<Page, { width: number; height: number }>();
const HIDE_BANNER = "lookout-hide-banner";
const SECTION_TOP = 100;
const SECTION_HEADROOM = 200;
/** The section's box, measured twice a few frames apart until it holds still. */
async function settledSectionHeight(page: Page, selector: string): Promise<number> {
  let last = -1;
  for (let round = 0; round < 6; round++) {
    const box = await page.locator(selector).first().boundingBox();
    const height = Math.ceil(box?.height ?? 0);
    if (height === last) return height;
    last = height;
    await page.waitForTimeout(350);
  }
  return last;
}
for (const id of V4_SECTIONS) {
  const section = `[data-detail-section=${id}]`;
  states[`fit-section-${id}`] = {
    description: `The ${id} section of a component page, the window grown to hold it, the navbar hidden`,
    prepare: async (page: Page) => {
      const viewport = page.viewportSize();
      if (viewport) sectionViewports.set(page, viewport);
      await page.addStyleTag({ content: `#${HIDE_BANNER}, [role="banner"] { visibility: hidden !important; }` });
      await page.evaluate((marker) => {
        const style = Array.from(document.querySelectorAll("style")).find((node) => node.textContent?.includes(marker));
        if (style) style.id = marker;
      }, HIDE_BANNER);
      // Grow the window to the section plus headroom, scroll the inner view so the section
      // starts SECTION_TOP below the window's top, and let the section's height and the
      // backdrop settle: a crop past the painted window showed the document under the last
      // cards (the 2026-10-28 rulings on Variants and Usage), and growing to the section's
      // exact height left no room for a late layout pass.
      const width = viewport?.width ?? 1440;
      for (let round = 0; round < 3; round++) {
        const height = await settledSectionHeight(page, section);
        await page.setViewportSize({ width, height: Math.min(height + SECTION_TOP + SECTION_HEADROOM, 16000) });
        await page.waitForTimeout(400);
        await page.locator(section).first().evaluate((node, top) => {
          const scroller = node.closest<HTMLElement>("[data-page-scroll]");
          if (scroller) scroller.scrollTop += node.getBoundingClientRect().top - top;
        }, SECTION_TOP);
        await page.waitForTimeout(400);
        const after = await settledSectionHeight(page, section);
        if (after === height) break;
      }
      await page
        .waitForFunction(() => {
          const backdrop = document.querySelector("[data-page-backdrop]");
          return backdrop != null && Math.round(backdrop.getBoundingClientRect().bottom) >= window.innerHeight - 1;
        }, undefined, { timeout: 5000 })
        .catch(() => undefined);
      await page.waitForTimeout(300);
    },
    restore: async (page: Page) => {
      await page.evaluate((marker) => document.getElementById(marker)?.remove(), HIDE_BANNER);
      const viewport = sectionViewports.get(page);
      if (viewport) await page.setViewportSize(viewport);
      sectionViewports.delete(page);
    },
    element: section,
  };
}

const V4_PAGES: { path: string; name: string; file: string }[] = [
  { path: "/", name: "library", file: "pages/library.png" },
  ...["foundations", "layout", "controls", "inputs", "navigation", "data", "charts", "overlays"].map((section) => ({
    path: `/sections/${section}`,
    name: `section-${section}`,
    file: `pages/${section}.png`,
  })),
  { path: "/skins", name: "skins", file: "pages/skins.png" },
];

const TEMPLATE_REFERENCES: Record<string, string> = {
  ...Object.fromEntries(["activity", "api-keys", "billing", "calendar", "chat", "dashboard", "detail-sidebar", "identities", "inbox", "kanban", "onboarding", "pricing", "profile", "settings", "team"].map((slug) => [slug, slug])),
  errors: "errors-empty",
  signin: "sign-in",
  signup: "sign-up",
};

const v4Routes: RouteDef[] = [
  ...V4_PAGES.map(({ path, name, file }) => ({ path, name: `v4-${name}`, design: reference(file), states: ["whole-page"] })),
  // A component's reference is its detail page down to its Platforms section.
  ...componentRoutes
    .filter((route) => route.path.startsWith("/components/"))
    .map((route) => {
      const slug = route.path.slice("/components/".length);
      return { path: route.path, name: `v4-${slug}`, design: reference(`components/${slug}.png`), states: ["whole-page"] };
    }),
  // A component's sections, each against its own crop of the hand-off's page. The ?section=
  // query is what gives each its own route identity: Lookout keys a route by its path, and
  // sets its own surface and palette parameters on the URL with searchParams.set, so a path
  // that already carries a query keeps it.
  ...componentRoutes
    .filter((route) => route.path.startsWith("/components/"))
    .flatMap((route) => {
      const slug = route.path.slice("/components/".length);
      return V4_SECTIONS.map((id) => ({
        path: `${route.path}?section=${id}`,
        name: `v4-${slug}-${id}`,
        element: `[data-detail-section=${id}]`,
        design: reference(`components/${slug}/${id}.png`),
        states: [`fit-section-${id}`],
        // The fit state frames the whole section; a rest shot of a section below the first
        // window is one band of the inner scroller, which the judge filed as a blank page.
        rest: false,
      }));
    }),
  // A template's reference is the hand-off's Templates page showing it in the Web frame,
  // filed under the hand-off's own names where they differ from the docs' slugs.
  ...Object.entries(TEMPLATE_REFERENCES).map(([slug, file]) => ({
    path: `/templates/${slug}`,
    name: `v4-template-${slug}`,
    design: reference(`templates/${file}-web.png`),
    states: ["whole-page"],
  })),
];

const config: LookoutConfig = {
  project: "canvas",

  targets: [
    {
      // The hand-off parity pass: web only, in the hand-off's default look. Run with
      // `--targets v4 --schemes dark --viewports desktop` (the references are 1440 dark).
      name: "v4",
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev  (Metro on 8081)",
      query: { surface: "glass", palette: "violet" },
      // The references are photographed at scale 1 (tools/v4/capture-references.ts), so the
      // docs are shot at the same scale: the pixel comparison then needs no resampling and a
      // section crop reaches the judge at the size the hand-off drew it.
      deviceScaleFactor: 1,
      routes: v4Routes.map((route) => ({ ...route, platforms: ["web"] as ("web")[] })),
    },
    {
      name: "docs",
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev  (Metro on 8081, preview opener on 8790)",
      query: { surface: "solid" },
      routes: componentRoutes,
    },
    {
      // Browser skin previews prove browser rendering, never native materials.
      name: "glass",
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev",
      query: { surface: "glass" },
      routes: MATERIAL_ROUTES.map(({ path, slug }) => ({
        path,
        name: `${slug}-glass`,
        element: "[data-preview-card]",
        states: ["full-content", ...(slug === "button-group" ? ["button-group-held"] : OVERLAY_STATE[slug] ? [OVERLAY_STATE[slug]!] : [])],
      })),
    },
    ...(["glass", "solid"] as const).map((surface) => ({
      name: `native-${surface}`,
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev; boot a simulator or emulator with the Canvas docs app installed",
      // Native capture currently supports resting deep links only. Browser state
      // recipes cannot establish an opened native overlay or native liquid motion.
      routes: nativeMaterialRoutes(surface).map(({ path, slug }) => ({
        path,
        name: `${slug}-native-${surface}`,
        platforms: ["ios", "android"] as ("ios" | "android")[],
      })),
    })),
  ],

  // The docs seed theme state from the launch URL (docs-theme.tsx).
  scheme: { mode: "url-param", param: "scheme" },

  states,

  rubric: "./lookout.rubric.md",

  neverFile: [
    "the Library Index heading reading '<count> components' with the owner's copy beneath it, where the hand-off titles it 'Index': the owner's copy (2026-10-28)",
    "the Library eyebrow printing the package's current version where the hand-off prints v4.0.0: it reads package.json and reaches 4.0.0 with the release",
    "differences in sample data inside live examples (names, figures, dates, avatars): illustrative content, unless it is literally placeholder text or a layout follows from it",
    "the grain overlay's noise pattern differing pixel for pixel: it is random by construction",
    "motion and hover states (the heroes' loops, the aurora drift, reveals, hover lifts): a still cannot show them, and they are judged through the tuning harness",
    "Android press ripple absent in WEB-ROW previews: ripple is device-only; never judge it from web shots in either direction",
    "the iOS and Android rows on WEB captures are browser previews of the native skins: judge their metrics and anatomy, but material and feedback fidelity only from device shots",
    "the circular indicator in Spinner and in a loading Button: information-bearing motion by design; Skeleton is the shimmer",
    "pill-shaped chips and badges on the iOS and Android rows: platform shape, not a rounding accident",
    "10pt tab-bar labels on iOS rows: the HIG size for that control",
    "the Do and Don't section on a component page, which the hand-off does not draw: the owner keeps it (PLAN P3, rule S8), after Usage, in the hand-off's card look (2026-10-28)",
    "the example picker, form-factor switcher and code block above and below the Platform skins cards, which the hand-off does not draw: the owner keeps them for the docs and glass targets and the e2e recipes, and their look is still judged (2026-10-28)",
    "the Platform skins cards rendering the chosen example where the hand-off renders the playground's props: the same owner decision that keeps the example picker, form-factor switcher and code block (2026-10-28)",
    "the floating navbar pill's row cut at the window's edge at tablet and phone widths: the hand-off's pill is `max-width:100%;overflow-x:auto` and scrolls sideways where it does not fit (measured at 834 px: the hand-off's row 1177 px in an 800 px pill, the docs' 1221 in 800), as design-language item 8 records (2026-10-28)",
    "which paragraphs, example cards, variants, prop rows, semantics rows, token chips and related tiles a component page shows, and their wording: that content is read from the repository's current .md files and source, while the hand-off carries a snapshot of them (its canvas-docs.js, tools/v4/README.md: the repository wins); how each is drawn is still judged (2026-10-28)",
  ],

  // Where a defect gets fixed. This repository IS the kit, so a finding on a docs
  // page is almost always a fix in src/, not in the page that showed it.
  designSystem: {
    name: "Canvas",
    packageRoot: ".",
    componentRoots: ["./src/atoms", "./src/molecules", "./src/organisms", "./src/charts"],
    importPrefixes: ["@nannier/canvas"],
    tokenFiles: ["./src/style/tokens.ts", "./styles/canvas.css"],
  },

  native: {
    // Default native run captures glass. For the matching solid run set
    // CANVAS_LOOKOUT_NATIVE_SURFACE=solid and select --targets native-solid.
    target: nativeMaterialTarget(),
    ios: {
      deepLinkScheme: "canvas",
      bundleId: "com.nannier.canvas",
      appearanceParam: "scheme",
      startHint: "Boot an iOS simulator with com.nannier.canvas installed, then run cd docs && bun run dev",
    },
    android: {
      deepLinkScheme: "canvas",
      bundleId: "com.nannier.canvas",
      appearanceParam: "scheme",
      settleMs: 14000,
      startHint: "Boot an Android emulator with com.nannier.canvas installed; set ADB to the SDK adb path if needed; run cd docs && bun run dev",
    },
  },
};

export default config;
