import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dir, "../..");
const smoke = resolve(root, "smoke");
const fixtures = readdirSync(resolve(smoke, "src/testing")).filter((file) => file.endsWith(".tsx")).map((file) => file.slice(0, -4)).sort();

test("docs and the smoke app consume one maintained public-API fixture body", () => {
  expect(fixtures.length).toBeGreaterThan(0);
  for (const fixture of fixtures.filter((name) => name !== "diagnostics")) {
    const shared = readFileSync(resolve(smoke, `src/testing/${fixture}.tsx`), "utf8");
    const ast = ts.createSourceFile("fixture.tsx", shared, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const statement of ast.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        if (fixture === "form-autocomplete" && statement.moduleSpecifier.text === "react-native") {
          const bindings = statement.importClause?.namedBindings;
          // React Native's own useWindowDimensions: the kit's pass-through is a deprecated
          // alias (audit K12-2 OD5), and raw window pixels are React Native's.
          expect(bindings && ts.isNamedImports(bindings) ? bindings.elements.map((entry) => entry.name.text) : []).toEqual(["Keyboard", "useWindowDimensions"]);
        } else if ((fixture === "carousel" || fixture === "escape-layers") && statement.moduleSpecifier.text === "react-native") {
          // Device geometry for the measurements only: every rendered element is Canvas's.
          const bindings = statement.importClause?.namedBindings;
          expect(bindings && ts.isNamedImports(bindings) ? bindings.elements.map((entry) => entry.name.text) : [])
            .toEqual(["Dimensions", "I18nManager", "PixelRatio", "Platform"]);
        } else if (fixture === "catalog" && statement.moduleSpecifier.text.startsWith("../catalog/")) {
          // The catalog sweep renders the smoke app's own component list and example scope.
        } else expect(["react", "@nannier/canvas"]).toContain(statement.moduleSpecifier.text);
      }
    }
    const route = readFileSync(resolve(smoke, `src/app/testing/${fixture}.tsx`), "utf8");
    expect(route).toContain(`../../testing/${fixture}`);
  }
  for (const fixture of ["form-autocomplete", "listbox", "escape-layers", "control-refs", "tabs", "materials", "hover", "avatar", "touch-target"]) {
    const docs = readFileSync(resolve(root, `docs/src/app/(home)/testing/${fixture}.tsx`), "utf8");
    expect(docs).toContain(`smoke/src/testing/${fixture}`);
  }
  const metadata = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  expect(metadata.files).not.toContain("smoke");
  // The starter is a plain example again: no smoke screens or routes live in it.
  expect(existsSync(resolve(root, "examples/starter/smoke"))).toBe(false);
  expect(existsSync(resolve(root, "examples/starter/src/testing"))).toBe(false);
  expect(existsSync(resolve(root, "examples/starter/src/app/testing"))).toBe(false);
});

test("every journey and every native flow link targets a route of the smoke app", () => {
  const journeys = readFileSync(resolve(smoke, "src/catalog/journeys.ts"), "utf8");
  const listed = [...journeys.matchAll(/route: "\/testing\/([a-z-]+)"/g)].map((match) => match[1]).sort();
  expect(listed).toEqual(fixtures);
  const commands: unknown = ["candidate.yaml", "after-carousel.yaml"].map((file) => {
    const source = readFileSync(resolve(root, "tools/native/flows", file), "utf8");
    return Bun.YAML.parse(source.split("\n---\n")[1]!);
  });
  const routes = new Set<string>();
  function visit(value: unknown) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key === "openLink" && typeof child === "string") {
          const route = new URL(child).pathname.replace(/^\/testing\//, "");
          expect(fixtures).toContain(route);
          expect(existsSync(resolve(smoke, `src/app/testing/${route}.tsx`))).toBe(true);
          routes.add(route);
        }
        visit(child);
      }
    }
  }
  visit(commands);
  expect(routes.size).toBeGreaterThan(5);
});
