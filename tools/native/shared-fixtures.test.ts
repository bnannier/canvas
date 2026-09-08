import { expect, test } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import ts from "typescript";
import { installSmokeFixtures } from "./fixtures.mjs";

const root = resolve(import.meta.dir, "../..");

test("docs and native routes consume one maintained public-API fixture body", () => {
  for (const fixture of ["form-autocomplete", "listbox", "escape-layers", "control-refs"]) {
    const shared = readFileSync(resolve(root, `examples/starter/smoke/fixtures/${fixture}.tsx`), "utf8");
    const ast = ts.createSourceFile("fixture.tsx", shared, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const statement of ast.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        expect(["react", "@nannier-com/canvas"]).toContain(statement.moduleSpecifier.text);
      }
    }
    const docs = readFileSync(resolve(root, `docs/src/app/(home)/testing/${fixture}.tsx`), "utf8");
    const native = readFileSync(resolve(root, `examples/starter/smoke/routes/${fixture}.tsx`), "utf8");
    expect(docs).toContain(`examples/starter/smoke/fixtures/${fixture}`);
    expect(native).toContain(`../../testing/${fixture}`);
  }
  const metadata = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  expect(metadata.files).not.toContain("examples");
  expect(metadata.files).not.toContain("examples/starter");
  expect(existsSync(resolve(root, "examples/starter/src/testing"))).toBe(false);
  expect(existsSync(resolve(root, "examples/starter/src/app/testing"))).toBe(false);
});

test("candidate preparation installs exactly the manifest-listed bodies and routes without overwriting app files", () => {
  const app = mkdtempSync(join(tmpdir(), "canvas-smoke-fixtures-"));
  try {
    cpSync(resolve(root, "examples/starter/smoke"), join(app, "smoke"), { recursive: true });
    writeFileSync(join(app, "smoke/fixtures/unreviewed.tsx"), "export const unreviewed = true;");
    installSmokeFixtures(app);
    const manifest = JSON.parse(readFileSync(join(app, "smoke/manifest.json"), "utf8"));
    for (const [kind, destination] of [["fixtures", "src/testing"], ["routes", "src/app/testing"]]) {
      for (const name of manifest[kind]) {
        expect(readFileSync(join(app, destination!, `${name}.tsx`), "utf8"))
          .toBe(readFileSync(join(app, "smoke", kind!, `${name}.tsx`), "utf8"));
      }
    }
    expect(existsSync(join(app, "src/testing/unreviewed.tsx"))).toBe(false);
    const route = join(app, "src/app/testing/control-refs.tsx");
    writeFileSync(route, "Existing app route");
    expect(() => installSmokeFixtures(app)).toThrow("already exists");
    expect(readFileSync(route, "utf8")).toBe("Existing app route");
  } finally { rmSync(app, { recursive: true, force: true }); }
});

test("invalid smoke manifest paths fail before creating any app source", () => {
  const app = mkdtempSync(join(tmpdir(), "canvas-smoke-manifest-"));
  try {
    cpSync(resolve(root, "examples/starter/smoke"), join(app, "smoke"), { recursive: true });
    const manifestPath = join(app, "smoke/manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, routes: ["../../escape"] }));
    expect(() => installSmokeFixtures(app)).toThrow("Invalid smoke routes manifest");
    expect(existsSync(join(app, "src"))).toBe(false);
  } finally { rmSync(app, { recursive: true, force: true }); }
});
