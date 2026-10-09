import { expect, test } from "bun:test";
import { checkPublicApi, type ApiInventory, type ApiManifest } from "./check";
import type { ApiEntry, ApiExport, DocsPage } from "./types";

const exported = (name: string, facts: Partial<ApiExport> = {}): ApiExport => ({
  name, value: true, renderable: false, callable: false, deprecated: false, files: [], ...facts,
});

const EXPORTS: ApiExport[] = [
  exported("Field", { renderable: true }),
  exported("FieldProps", { value: false }),
  exported("useField", { callable: true }),
  exported("fieldWidths"),
  exported("measureField", { callable: true }),
  exported("FIELD_WASH", { deprecated: true }),
];

const page = (route: string, text: string, headings: string[] = []): DocsPage => ({ route, sources: [`${route}.tsx`], text, headings });
const PAGES = new Map([
  ["components/field", page("components/field", "Field\nA labelled input.\n<Field label=\"Email\" />\nFieldProps\nlabel string", ["Default", "With error"])],
  ["guides/fields", page("guides/fields", "const { width } = useField();\nimport \"@nannier/canvas/styles/field.css\";", ["Hooks"])],
]);

function inventory(overrides: Partial<ApiInventory> = {}): ApiInventory {
  return {
    packageName: "@nannier/canvas",
    exports: { web: EXPORTS, ios: EXPORTS, android: EXPORTS },
    packageEntryPoints: [".", "./styles/*"],
    entryPointFiles: { "./styles/*": ["styles/field.css"] },
    pages: PAGES,
    ...overrides,
  };
}

const API: Record<string, ApiEntry> = {
  Field: { kind: "component", docs: "components/field", section: "Default" },
  FieldProps: { kind: "type", docs: "components/field" },
  useField: { kind: "hook", docs: "guides/fields", section: "Hooks" },
  fieldWidths: { kind: "token", docs: "undocumented" },
  measureField: { kind: "internal-by-accident", docs: "undocumented" },
  FIELD_WASH: { kind: "deprecated-alias", docs: "undocumented", replacement: "fieldWidths" },
};

function manifest(api: Record<string, ApiEntry> = API, overrides: Partial<ApiManifest> = {}): ApiManifest {
  return {
    entryPoints: { ".": "module", "./styles/*": "files" },
    publicApi: api,
    files: { "styles/field.css": { kind: "token", docs: "guides/fields" } },
    ...overrides,
  };
}

const errorsOf = (inv: ApiInventory, man: ApiManifest) => checkPublicApi(inv, man).errors;

test("a fully classified surface with true docs claims passes, and the counts add up", () => {
  const result = checkPublicApi(inventory(), manifest());
  expect(result.errors).toEqual([]);
  expect(result.exports).toBe(6);
  expect(result.documented).toBe(3);
  expect(result.undocumented).toBe(3);
  expect(result.files).toBe(1);
  expect(result.kinds.component).toBe(1);
  expect(result.kinds["internal-by-accident"]).toBe(1);
});

test("an export added or removed without its manifest entry fails", () => {
  const added = [...EXPORTS, exported("FieldGroup", { renderable: true })];
  expect(errorsOf(inventory({ exports: { web: added, ios: added, android: added } }), manifest())).toEqual(["Unclassified export: FieldGroup"]);
  const removed = EXPORTS.filter((entry) => entry.name !== "measureField");
  expect(errorsOf(inventory({ exports: { web: removed, ios: removed, android: removed } }), manifest())).toEqual(["Removed export still classified: measureField"]);
  // A prototype key is not an entry: an export named like one still needs classifying.
  const proto = [...EXPORTS, exported("toString", { callable: true })];
  expect(errorsOf(inventory({ exports: { web: proto, ios: proto, android: proto } }), manifest())).toContain("Unclassified export: toString");
});

test("the iOS and Android resolutions must export exactly what the web entry does", () => {
  const ios = EXPORTS.filter((entry) => entry.name !== "useField");
  const android = [...EXPORTS.map((entry) => (entry.name === "FieldProps" ? { ...entry, value: true } : entry)), exported("AndroidOnly")];
  const errors = errorsOf(inventory({ exports: { web: EXPORTS, ios, android } }), manifest());
  expect(errors).toContain("useField is exported on the web but not on ios");
  expect(errors).toContain("FieldProps is type-only on the web but a value on android");
  expect(errors).toContain("AndroidOnly is exported on android but not on the web");
});

test("a kind must agree with what the checker sees", () => {
  const errors = errorsOf(inventory(), manifest({
    Field: { kind: "utility", docs: "undocumented" },
    FieldProps: { kind: "utility", docs: "undocumented" },
    useField: { kind: "utility", docs: "undocumented" },
    fieldWidths: { kind: "type", docs: "undocumented" },
    measureField: { kind: "token", docs: "undocumented" },
    FIELD_WASH: { kind: "token", docs: "undocumented" },
  }));
  expect(errors).toContain("Field renders as a component but is classified as utility");
  expect(errors).toContain("FieldProps is type-only but classified as utility");
  expect(errors).toContain("useField is a use* function but classified as utility");
  expect(errors).toContain("fieldWidths has a runtime value but is classified as type");
  expect(errors).toContain("measureField is classified as token but is a function");
  expect(errors).toContain("FIELD_WASH carries @deprecated but is classified as token");
  const misnamed = errorsOf(inventory(), manifest({ ...API, measureField: { kind: "hook", docs: "undocumented" }, fieldWidths: { kind: "component", docs: "undocumented" } }));
  expect(misnamed).toContain("measureField is classified as hook but is not a use* function");
  expect(misnamed).toContain("fieldWidths is classified as component but does not render as a component");
  const unknown = errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "constant" as never, docs: "undocumented" } }));
  expect(unknown).toContain("Unknown kind for fieldWidths: constant");
  // Internal helper types and deprecated type aliases are type-only too.
  expect(errorsOf(inventory(), manifest({ ...API, FieldProps: { kind: "internal-by-accident", docs: "undocumented" } }))).toEqual([]);
});

test("deprecated aliases match their @deprecated tag and name a live replacement", () => {
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "deprecated-alias", docs: "undocumented" } })))
    .toContain("fieldWidths is classified as deprecated-alias but carries no @deprecated tag");
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { ...API.FIELD_WASH, replacement: "fieldWidth" } })))
    .toContain("FIELD_WASH's replacement is not a public export: fieldWidth");
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { ...API.FIELD_WASH, replacement: "measureField" } })))
    .toContain("FIELD_WASH's replacement measureField is itself internal-by-accident");
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", docs: "undocumented", replacement: "Field" } })))
    .toContain("fieldWidths names a replacement but is not a deprecated alias");
  // A deprecated alias with nothing to replace it (brandColors) is allowed.
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { kind: "deprecated-alias", docs: "undocumented" } }))).toEqual([]);
});

test("a docs claim names a real route that names the export, and a real section", () => {
  expect(errorsOf(inventory(), manifest({ ...API, Field: { kind: "component", docs: "components/fields" } })))
    .toEqual(["Unknown docs route for Field: components/fields"]);
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", docs: "components/field" } })))
    .toEqual(["Docs route components/field never names fieldWidths in what it renders (components/field.tsx): record it as undocumented, or document it there"]);
  expect(errorsOf(inventory(), manifest({ ...API, Field: { kind: "component", docs: "components/field", section: "Sizes" } })))
    .toEqual(["Docs route components/field has no section \"Sizes\" for Field"]);
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", docs: "undocumented", section: "Hooks" } })))
    .toEqual(["fieldWidths is undocumented but names a section: Hooks"]);
  // `Field` appears inside `FieldProps` and `useField`; only a whole name counts.
  const only = new Map([...PAGES, ["components/field", page("components/field", "FieldProps useField")]]);
  expect(errorsOf(inventory({ pages: only }), manifest({ ...API, Field: { kind: "component", docs: "components/field" }, FieldProps: { kind: "type", docs: "undocumented" } })))
    .toEqual(["Docs route components/field never names Field in what it renders (components/field.tsx): record it as undocumented, or document it there"]);
});

test("package entry points are classified, and only the read module entry may be a module", () => {
  expect(errorsOf(inventory({ packageEntryPoints: [".", "./styles/*", "./internals"] }), manifest()))
    .toEqual(["Unclassified package entry point: ./internals"]);
  expect(errorsOf(inventory({ packageEntryPoints: ["."] }), manifest()))
    .toContain("Removed package entry point still classified: ./styles/*");
  const extra = errorsOf(inventory({ packageEntryPoints: [".", "./styles/*", "./internals"] }), manifest(API, { entryPoints: { ".": "module", "./styles/*": "files", "./internals": "module" } }));
  expect(extra).toEqual(["Entry point ./internals is a module, but the gate reads only \".\" (src/index.ts): teach tools/api/discover.ts its entry first"]);
});

test("every file a file entry point reaches is classified, with its specifier on its docs page", () => {
  expect(errorsOf(inventory({ entryPointFiles: { "./styles/*": ["styles/field.css", "styles/extra.css"] } }), manifest()))
    .toEqual(["Unclassified file reached by a package entry point: styles/extra.css"]);
  expect(errorsOf(inventory({ entryPointFiles: { "./styles/*": [] } }), manifest()))
    .toEqual(["Removed file still classified: styles/field.css"]);
  const wrong = errorsOf(inventory(), manifest(API, { files: { "styles/field.css": { kind: "hook", docs: "components/field" } } }));
  expect(wrong).toContain("styles/field.css is a file but classified as hook");
  expect(wrong).toContain("Docs route components/field never names styles/field.css in what it renders (components/field.tsx): record it as undocumented, or document it there");
});
