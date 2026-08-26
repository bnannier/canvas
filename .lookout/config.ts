/**
 * lookout config for the Canvas docs (https://github.com/nannier-com/lookout).
 *
 * Targets the running docs app (bun run dev in docs/, Metro on 8081) and
 * derives the 100 component routes from nav.config.json, the same source
 * capture-ui.ts trusts (check-nav-sync holds it 1:1 with the docs core).
 *
 * Canonical judging runs on the SOLID surface (?surface=solid pinned via the
 * target query): glass frosts are GPU-nondeterministic and would churn the
 * judge's hash cache. The 14 functional-layer components get a separate
 * glass-target pass. Scheme switches ride the docs' launch-URL seeding
 * (?scheme=dark|light), which also powers native light capture
 * (canvas:///components/button?scheme=light).
 *
 * Type-only imports: erased at runtime (bun executes this file directly), so
 * nothing here requires @nannier-com/lookout to be installed in canvas.
 */
import type { LookoutConfig, RouteDef, StateRecipe } from "@nannier-com/lookout";
import type { Page } from "playwright";
import navConfig from "../docs/src/data/nav.config.json";

// ---------------------------------------------------------------------------
// Routes: every component page, element-shot on the preview card (the 3-up
// platform rows without the switcher row or code block; data-preview-card is
// the docs' tooling hook). Overlay-bearing routes add an open-state recipe.
// ---------------------------------------------------------------------------

const sidebar = (navConfig as {
  web: { sidebar: { components?: { slug: string }[] }[] };
}).web.sidebar;

const componentSlugs = sidebar.flatMap((group) => group.components ?? []).map((c) => c.slug);

/** Overlay routes and the state that opens them (see states below). */
const OVERLAY_STATE: Record<string, string> = {
  dialog: "open-dialog",
  "alert-dialog": "open-alert-dialog",
  dropdown: "open-dropdown",
  popover: "open-popover",
  "action-sheet": "open-action-sheet",
  drawer: "open-drawer",
  "row-menu": "open-row-menu",
  select: "open-select",
  autocomplete: "open-autocomplete",
  command: "open-command",
  toast: "show-toast",
};

const componentRoutes: RouteDef[] = componentSlugs.map((slug) => ({
  path: `/components/${slug}`,
  name: slug,
  element: "[data-preview-card]",
  states: OVERLAY_STATE[slug] ? [OVERLAY_STATE[slug]!] : [],
}));

/** Functional-layer components: the ones that render the glass material. */
const FUNCTIONAL_LAYER = [
  "dialog",
  "alert-dialog",
  "dropdown",
  "select",
  "autocomplete",
  "popover",
  "tooltip",
  "action-sheet",
  "drawer",
  "command",
  "row-menu",
  "navbars",
  "sidebar",
  "toast",
];

// ---------------------------------------------------------------------------
// Overlay recipes. Each clicks the LAST matching trigger inside the playground
// stage: the rows stack iOS, Android, Web, so the last trigger belongs to the
// Web row, the row whose behavior is native to the browser being driven. Open
// overlays portal to a stage-level outlet OUTSIDE the preview card, so every
// recipe forces a full-page shot (element: null).
// ---------------------------------------------------------------------------

const stage = (page: Page) => page.locator("[data-preview-stage]").first();

function clickTrigger(name: string | RegExp): StateRecipe {
  return {
    prepare: async (page) => {
      await stage(page).getByRole("button", { name }).last().click();
      await page.waitForTimeout(400);
    },
    restore: async (page) => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    },
    element: null,
  };
}

const states: Record<string, StateRecipe> = {
  "open-dialog": clickTrigger("Open dialog"),
  "open-alert-dialog": clickTrigger(/Delete identity/),
  "open-dropdown": clickTrigger("Actions"),
  "open-popover": clickTrigger("Open popover"),
  "open-action-sheet": clickTrigger("Add photo"),
  "open-drawer": clickTrigger("Open menu"),
  "show-toast": {
    // Toasts auto-dismiss: shoot right after the trigger, no restore needed.
    prepare: async (page) => {
      await stage(page).getByRole("button", { name: "Show toast" }).last().click();
      await page.waitForTimeout(350);
    },
    element: null,
  },
  "open-row-menu": {
    prepare: async (page) => {
      await stage(page).getByLabel("More options").last().click();
      await page.waitForTimeout(400);
    },
    restore: async (page) => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    },
    element: null,
  },
  "open-select": {
    // The collapsed field shows its current value; click it to drop the list.
    prepare: async (page) => {
      await stage(page).getByText("United States").last().click();
      await page.waitForTimeout(400);
    },
    restore: async (page) => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    },
    element: null,
  },
  "open-autocomplete": {
    prepare: async (page) => {
      const input = stage(page).getByRole("textbox").last();
      await input.click();
      await input.pressSequentially("a", { delay: 40 });
      await page.waitForTimeout(400);
    },
    restore: async (page) => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    },
    element: null,
  },
  "open-command": {
    prepare: async (page) => {
      await stage(page).getByText("Search commands", { exact: false }).last().click();
      await page.waitForTimeout(400);
    },
    restore: async (page) => {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    },
    element: null,
  },
};

// ---------------------------------------------------------------------------

const config: LookoutConfig = {
  project: "canvas",

  targets: [
    {
      name: "docs",
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev  (Metro on 8081, preview opener on 8790)",
      query: { surface: "solid" },
      routes: componentRoutes,
    },
    {
      // Glass regression pass: the functional-layer components under the
      // glass material, judged for glass-specific defects only.
      name: "glass",
      url: "http://localhost:8081",
      startHint: "cd docs && bun run dev",
      query: { surface: "glass" },
      routes: FUNCTIONAL_LAYER.map((slug) => ({
        path: `/components/${slug}`,
        name: `${slug}-glass`,
        element: "[data-preview-card]",
        states: OVERLAY_STATE[slug] ? [OVERLAY_STATE[slug]!] : [],
      })),
    },
  ],

  // The docs seed theme state from the launch URL (docs-theme.tsx).
  scheme: { mode: "url-param", param: "scheme" },

  states,

  rubric: "./rubric.md",

  neverFile: [
    "brand indigo primary instead of Material dynamic color: the kit's palette is shadcn-token based by design",
    "no tonal container / surface-tint palette on Android: by-design token approximation",
    "the brand type family everywhere: only size, weight, and line-height must map to platform roles",
    "glass mode stripping hairline borders: intended material behavior",
    "Android press ripple absent in WEB-ROW previews: ripple is device-only; never judge it from web shots in either direction",
    "the react-native-web blue focus outline box on web: a known RNW artifact, not a skin bug",
    "the small uppercase platform watermark (iOS / ANDROID / WEB) in each preview row corner: a docs harness label, not component content",
    "the iOS and Android rows on WEB captures are browser previews of the native skins: judge their metrics and anatomy, but material and feedback fidelity only from device shots",
  ],

  native: {
    target: "docs",
    ios: { deepLinkScheme: "canvas", bundleId: "com.nannier.canvas", appearanceParam: "scheme" },
    android: {
      deepLinkScheme: "canvas",
      bundleId: "com.nannier.canvas",
      appearanceParam: "scheme",
      settleMs: 14000,
    },
  },
};

export default config;
