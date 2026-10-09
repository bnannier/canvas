import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { MATERIAL_OVERLAY_RECIPES, OVERLAY_RECIPES } from "../../e2e/support/overlay-recipes.ts";
import { ROOT, componentRoutes, contentRoutes } from "../../e2e/support/routes.ts";
import { e2eReach } from "./facts.ts";
import { StaticReader } from "./static-eval.ts";
import { CATALOGS, UnreadableSweep, catalogHooks, readSweeps } from "./sweeps.ts";

/** The sweeps of a spec written at e2e/x/spec.e2e.ts, so `../support/routes` is the real catalog module. */
function sweepsOf(source: string) {
  const file = "e2e/x/spec.e2e.ts";
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return readSweeps({ root: ROOT, file, sf, reader: new StaticReader(sf, catalogHooks(ROOT, file)) }).sweeps;
}

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
      `${header}for (const recipe of OVERLAYS) gotoDocs(page, \`/components/\${recipe.slug}\`);\nfor (const slug of ["dialog", "row-menu"]) gotoDocs(page, \`/components/\${slug}\`);\nconst first = contentRoutes().find((r) => r.kind === "pattern")!.path;`,
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
