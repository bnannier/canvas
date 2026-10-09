import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MATERIAL_OVERLAY_RECIPES, OVERLAY_RECIPES } from "../../e2e/support/overlay-recipes.ts";
import { ROOT, componentRoutes, contentRoutes } from "../../e2e/support/routes.ts";
import { UnreadableNavigation, e2eIntercept, e2eReach, isSpecFile } from "./facts.ts";
import { ModuleGraph } from "./hosts.ts";
import { CATALOGS, UnreadableSweep, readSweeps } from "./sweeps.ts";

/** The sweeps of a spec written at e2e/x/spec.e2e.ts, so `../support/routes` is the real catalog module. */
function sweepsOf(source: string) {
  const file = "e2e/x/spec.e2e.ts";
  const reader = new ModuleGraph(ROOT, e2eIntercept(ROOT)).reader(file, source);
  return readSweeps({ root: ROOT, file, sf: reader.sf, reader }).sweeps;
}

/** What a spec at e2e/x/spec.e2e.ts reaches. */
const reachOf = (source: string, file = "e2e/x/spec.e2e.ts") => e2eReach(ROOT, file, source);

const header = 'import { componentRoutes, contentRoutes, allRoutes } from "../support/routes";\nimport { OVERLAYS } from "../support/overlays";\nimport { gotoDocs } from "../support/docs";\n';
const paths = (rows: { path: string }[]) => rows.map((r) => r.path);

describe("e2e catalog sweeps", () => {
  it("credits a loop over a catalog that navigates to each row's route", () => {
    const [sweep] = sweepsOf(`${header}for (const route of componentRoutes()) {\n  test(route.name, async ({ page }) => { await gotoDocs(page, route.path); });\n}`);
    expect(sweep.catalogs).toEqual(["componentRoutes"]);
    expect(sweep.routes).toEqual(paths(componentRoutes()));
    // A recipe catalog drives each overlay's own page.
    const [overlays] = sweepsOf(`${header}for (const recipe of OVERLAYS) test(recipe.slug, async ({ page }) => gotoDocs(page, \`/components/\${recipe.slug}\`));`);
    expect(overlays.routes).toEqual(OVERLAY_RECIPES.map((r) => `/components/${r.slug}`));
  });

  it("follows a filter it can evaluate, a map, a spread, a const and a local helper that navigates", () => {
    const templates = paths(contentRoutes().filter((r) => r.kind === "template"));
    const [spread] = sweepsOf(
      `${header}const SWEPT = [...contentRoutes().filter((route) => route.kind === "template").map((route) => route.path), "/components/form"];\nfor (const path of SWEPT) test(path, ({ page }) => gotoDocs(page, path));`,
    );
    // The literal is a route the spec names; the sweep is the spread's rows alone.
    expect(spread).toMatchObject({ catalogs: ["contentRoutes"], routes: templates });
    const [helper] = sweepsOf(
      `${header}async function expectFits(page, path: string) { await gotoDocs(page, path); }\nconst routes = contentRoutes();\nfor (const route of routes as Route[]) test(route.name, ({ page }) => expectFits(page, route.path));`,
    );
    expect(helper.routes).toEqual(paths(contentRoutes()));
    const [forEach] = sweepsOf(`${header}allRoutes().forEach((route) => test(route.name, ({ page }) => page.goto(route.path)));`);
    expect(forEach.catalogs).toEqual(["allRoutes"]);
  });

  it("does not count a loop over a catalog that only checks its data, or a lookup in one", () => {
    expect(sweepsOf(`${header}for (const route of componentRoutes()) assert.ok(route.path.startsWith("/components/"));`)).toEqual([]);
    expect(sweepsOf(`${header}const dialog = OVERLAYS.find((r) => r.slug === "dialog")!;\ntest("d", ({ page }) => gotoDocs(page, "/components/dialog"));`)).toEqual([]);
  });

  it("refuses a loop over a catalog it cannot follow, rather than miss its routes", () => {
    expect(() => sweepsOf(`${header}import { kind } from "./kind";\nfor (const r of contentRoutes().filter((x) => x.kind === kind)) test(r.name, ({ page }) => gotoDocs(page, r.path));`)).toThrow(UnreadableSweep);
    expect(() => sweepsOf(`${header}for (const r of componentRoutes().slice(0, 3)) test(r.name, ({ page }) => gotoDocs(page, r.path));`)).toThrow(/iterates a catalog in a form the reader does not follow/);
  });

  it("leaves a catalog loop's rows out of the routes a spec names, but builds the ones it names from literals", () => {
    const reach = e2eReach(
      ROOT,
      "e2e/x/spec.e2e.ts",
      `${header}for (const recipe of OVERLAYS) gotoDocs(page, \`/components/\${recipe.slug}\`);\nfor (const slug of ["dialog", "row-menu"]) gotoDocs(page, \`/components/\${slug}\`);\ngotoDocs(page, contentRoutes().find((r) => r.kind === "pattern")!.path);`,
    );
    const built = reach.literals.filter((l) => !l.open).map((l) => l.text);
    expect(built).toContain("/components/dialog");
    expect(built).toContain("/components/row-menu");
    expect(built).toContain(contentRoutes().find((r) => r.kind === "pattern")!.path);
    expect(built).not.toContain(`/components/${OVERLAY_RECIPES.find((r) => r.slug !== "dialog" && r.slug !== "row-menu")!.slug}`);
    expect(reach.sweeps.map((s) => s.catalogs)).toEqual([["OVERLAYS"]]);
  });

  it("reads the bound overlays through their recipes, which e2e/support/overlays.ts maps slug for slug", () => {
    // The catalog stands OVERLAYS and MATERIAL_OVERLAYS in for the recipes they bind,
    // because the bound module imports Playwright; this holds that they are a map of them.
    const source = readFileSync(join(ROOT, "e2e/support/overlays.ts"), "utf8").replace(/\s+/g, " ");
    expect(source).toContain("export const OVERLAYS: BoundOverlay[] = OVERLAY_RECIPES.map(bind);");
    expect(source).toContain("export const MATERIAL_OVERLAYS: BoundOverlay[] = MATERIAL_OVERLAY_RECIPES.map(bind);");
    expect(source).toMatch(/function bind\(recipe: OverlayRecipe\): BoundOverlay \{ return \{ slug: recipe\.slug,/);
    const rows = (name: string) => CATALOGS.find((c) => c.module === "e2e/support/overlays" && c.name === name)!.rows([]);
    expect(rows("OVERLAYS")).toEqual(OVERLAY_RECIPES);
    expect(rows("MATERIAL_OVERLAYS")).toEqual(MATERIAL_OVERLAY_RECIPES);
  });

  it("follows an indexed for, a for...in and a .map() callback that navigates (item b)", () => {
    const all = paths(componentRoutes());
    const [indexed] = sweepsOf(`${header}const routes = componentRoutes();\nfor (let i = 0; i < routes.length; i++) test(routes[i].name, ({ page }) => gotoDocs(page, routes[i].path));`);
    expect(indexed).toMatchObject({ catalogs: ["componentRoutes"], routes: all });
    const [keyed] = sweepsOf(`${header}const routes = componentRoutes();\nfor (const k in routes) test(k, ({ page }) => gotoDocs(page, routes[k].path));`);
    expect(keyed).toMatchObject({ catalogs: ["componentRoutes"], routes: all });
    const [mapped] = sweepsOf(`${header}componentRoutes().map((route) => test(route.name, ({ page }) => gotoDocs(page, route.path)));`);
    expect(mapped).toMatchObject({ catalogs: ["componentRoutes"], routes: all });
    // A callback that stops at the first row it decides cannot say which rows it drives.
    expect(() => sweepsOf(`${header}componentRoutes().some((route) => gotoDocs(page, route.path));`)).toThrow(UnreadableSweep);
    // A catalog's rows the spec changes are not the catalog's (item g).
    expect(() => sweepsOf(`${header}const routes = componentRoutes();\nroutes.push({ path: "/x" });\nfor (const r of routes) gotoDocs(page, r.path);`)).toThrow(/routes, a catalog's rows the module changes at line 5/);
    // An indexed loop in another form is not followed, and says so.
    expect(() => sweepsOf(`${header}const routes = componentRoutes();\nfor (let i = 0; i < componentRoutes().length; i += 2) gotoDocs(page, routes[i].path);`)).toThrow(UnreadableSweep);
  });

  it("credits a sweep with the rows its guards let through, and fails on a guard it cannot read (item b)", () => {
    const guarded = sweepsOf(`${header}for (const route of componentRoutes()) {\n  if (route.name !== "button") continue;\n  test(route.name, ({ page }) => gotoDocs(page, route.path));\n}`);
    expect(guarded).toMatchObject([{ catalogs: ["componentRoutes"], routes: ["/components/button"] }]);
    expect(() => reachOf(`${header}for (const route of componentRoutes()) {\n  if (process.env[route.name]) continue;\n  test(route.name, ({ page }) => gotoDocs(page, route.path));\n}`)).toThrow(UnreadableNavigation);
  });

  it("names the route a helper builds from its caller's row, and fails on a navigation it cannot resolve (HIGH 1)", () => {
    // e2e/behavior/text-entry-clear.e2e.ts's shape: the route is built in a helper from the row a loop hands it.
    const reach = reachOf(
      [
        header,
        'const fields = [{ slug: "textarea" }, { slug: "input-otp" }];',
        'const additional = [{ slug: "phone-input", variant: "Default" }];',
        "async function entry(page, recipe, width: number) {",
        "  await gotoDocs(page, `/components/${recipe.slug}`, { viewport: { width, height: 900 } });",
        "}",
        "for (const recipe of [...fields, ...additional]) for (const width of [1280, 390]) {",
        '  if (recipe.variant === "Default" && width !== 390) continue;',
        "  test(recipe.slug, async ({ page }) => { await entry(page, recipe, width); });",
        "}",
      ].join("\n"),
    );
    expect(reach.navigations.flatMap((n) => n.named).sort()).toEqual(["/components/input-otp", "/components/phone-input", "/components/textarea"]);
    // A route read from a test's fixture, a let, or a helper the spec exports cannot be named.
    expect(() => reachOf(`${header}test("x", async ({ page, route }) => gotoDocs(page, route));`)).toThrow(UnreadableNavigation);
    expect(() => reachOf(`${header}let slug = "dialog";\ntest("x", async ({ page }) => gotoDocs(page, \`/components/\${slug}\`));`)).toThrow(/e2e\/x\/spec.e2e.ts:5/);
    expect(() => reachOf(`${header}export async function open(page, slug: string) { await gotoDocs(page, \`/components/\${slug}\`); }`)).toThrow(/open is exported/);
    // The suite's mount prefix is no part of a docs route.
    expect(reachOf('import { BASE_PATH } from "../support/docs";\ntest("p", async ({ page }) => page.goto(`${BASE_PATH}/privacy/`));').navigations[0].named).toEqual(["/privacy/"]);
  });

  it("counts the docs specs only: the starter's own suite and the audit's runner are not the docs (item d)", () => {
    expect(isSpecFile("e2e/behavior/text-entry-clear.e2e.ts")).toBe(true);
    expect(isSpecFile("e2e/starter/starter.spec.ts")).toBe(false);
    expect(isSpecFile("e2e/audit/variants.audit.ts")).toBe(false);
    expect(isSpecFile("e2e/audit/cell.e2e.ts")).toBe(false);
    expect(isSpecFile("e2e/support/docs.ts")).toBe(false);
    // A support module that navigates on its own would credit no spec: it fails.
    expect(() => reachOf(`${header}export async function home(page) { await page.goto("/"); }`, "e2e/support/home.ts")).toThrow(/a support module navigates/);
  });

  it("finds the real catalog sweeps the facts credit, and not the data check", () => {
    const sweepsIn = (file: string) => e2eReach(ROOT, file, readFileSync(join(ROOT, file), "utf8")).sweeps.flatMap((s) => s.catalogs);
    expect(sweepsIn("e2e/a11y/components.e2e.ts")).toEqual(["componentRoutes"]);
    expect(sweepsIn("e2e/visual/components.e2e.ts")).toEqual(["componentRoutes"]);
    expect(sweepsIn("e2e/smoke/examples.e2e.ts")).toEqual(["componentExamples"]);
    expect(sweepsIn("e2e/smoke/routes.e2e.ts")).toEqual(["allRoutes"]);
    expect(sweepsIn("e2e/responsive/component-widths.e2e.ts")).toEqual(["contentRoutes", "contentRoutes", "componentRoutes"]);
    expect(sweepsIn("e2e/visual/materials.e2e.ts")).toEqual(["MATERIAL_ROUTES"]);
    expect(sweepsIn("e2e/behavior/hydration-ids.e2e.ts")).toEqual(["contentRoutes"]);
    expect(sweepsIn("e2e/visual/material-coverage.e2e.ts")).toEqual([]);
  });
});
