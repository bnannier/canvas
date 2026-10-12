import { expect, test } from "bun:test";
import { checkPublicApi, FOUNDATION_ROUTE, type ApiInventory, type ApiManifest } from "./check";
import type { ApiEntry, ApiExport, DocsPage, PlannedRoute } from "./types";

const exported = (name: string, facts: Partial<ApiExport> = {}): ApiExport => ({
  name, value: true, renderable: false, callable: false, deprecated: false, deprecatedText: "", summary: true, summaryText: `${name}'s summary.`, files: ["src/field.ts"], ...facts,
});

const EXPORTS: ApiExport[] = [
  exported("Field", { renderable: true }),
  exported("FieldProps", { value: false }),
  exported("useField", { callable: true }),
  exported("fieldWidths"),
  exported("measureField", { callable: true, summary: false }),
  exported("FIELD_WASH", { deprecated: true, deprecatedText: "Use `fieldWidths`. It keeps working until a major.", summary: true, summaryText: "The old field wash." }),
];

// A page's code is the part of its text a reader sees as code; the fixtures give each page
// the same text for both unless a test is about the difference.
const page = (route: string, text: string, headings: string[] = [], code = text): DocsPage => ({ route, sources: [`${route}.tsx`], text, code, headings });
const PAGES = new Map([
  ["components/field", page("components/field", "Field\nA labelled input.\n<Field label=\"Email\" />\nFieldProps\nlabel string", ["Default", "With error"])],
  ["guides/fields", page("guides/fields", "const { width } = useField();\nimport \"@nannier/canvas/styles/field.css\";", ["Hooks"])],
  ["guides/layout", page("guides/layout", "Layout widths.", ["Widths"])],
]);

function inventory(overrides: Partial<ApiInventory> = {}): ApiInventory {
  return {
    packageName: "@nannier/canvas",
    exports: { web: EXPORTS, ios: EXPORTS, android: EXPORTS },
    packageEntryPoints: [".", "./styles/*"],
    entryPointFiles: { "./styles/*": ["styles/field.css"] },
    pages: PAGES,
    materialRoutes: new Map([["Field", "components/field"]]),
    auditTurns: new Set(["components/field", "foundation/reference"]),
    ...overrides,
  };
}

const API: Record<string, ApiEntry> = {
  Field: { kind: "component", docs: "components/field", section: "Default" },
  FieldProps: { kind: "type", docs: "components/field" },
  useField: { kind: "hook", docs: "guides/fields", section: "Hooks" },
  fieldWidths: { kind: "token" },
  measureField: { kind: "internal-by-accident" },
  FIELD_WASH: { kind: "deprecated-alias", replacement: "fieldWidths" },
};
const PENDING: Record<string, string> = { fieldWidths: "guides/layout", measureField: FOUNDATION_ROUTE, FIELD_WASH: FOUNDATION_ROUTE };
const PLANNED: Record<string, PlannedRoute> = { "guides/layout": { turn: "components/field" }, [FOUNDATION_ROUTE]: { turn: "foundation/reference" } };
// The plan once nothing is staged for guides/layout: only the reference is still open.
const FOUNDATION_ONLY: Record<string, PlannedRoute> = { [FOUNDATION_ROUTE]: PLANNED[FOUNDATION_ROUTE] };

function manifest(api: Record<string, ApiEntry> = API, overrides: Partial<ApiManifest> = {}): ApiManifest {
  return {
    entryPoints: { ".": "module", "./styles/*": "files" },
    publicApi: api,
    files: { "styles/field.css": { kind: "token", docs: "guides/fields" } },
    pendingDocs: PENDING,
    plannedRoutes: PLANNED,
    ...overrides,
  };
}

const errorsOf = (inv: ApiInventory, man: ApiManifest) => checkPublicApi(inv, man).errors;

test("a fully classified surface with true docs claims passes, and the counts add up", () => {
  const result = checkPublicApi(inventory(), manifest());
  expect(result.errors).toEqual([]);
  expect(result.exports).toBe(6);
  expect(result.documented).toBe(3);
  expect(result.pending).toBe(3);
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

test("the iOS and Android resolutions must export exactly what the web entry does, with the same facts", () => {
  const ios = EXPORTS.filter((entry) => entry.name !== "useField");
  const android = [...EXPORTS.map((entry) => (entry.name === "FieldProps" ? { ...entry, value: true } : entry)), exported("AndroidOnly")];
  const errors = errorsOf(inventory({ exports: { web: EXPORTS, ios, android } }), manifest());
  expect(errors).toContain("useField is exported on the web but not on ios");
  expect(errors).toContain("FieldProps is type-only on the web but a value on android");
  expect(errors).toContain("AndroidOnly is exported on android but not on the web");
  // A platform fork that turns the component into something else, or deprecates it on one
  // OS only, reshapes the API there although the name is still exported.
  const reshaped = EXPORTS.map((entry) => (entry.name === "Field" ? { ...entry, renderable: false } : entry.name === "useField" ? { ...entry, deprecated: true, callable: false } : entry));
  expect(errorsOf(inventory({ exports: { web: EXPORTS, ios: reshaped, android: EXPORTS } }), manifest())).toEqual([
    "Field is a component on the web but not a component on ios",
    "useField is callable on the web but not callable on ios",
    "useField is not @deprecated on the web but @deprecated on ios",
  ]);
});

test("a kind must agree with what the checker sees", () => {
  const errors = errorsOf(inventory(), manifest({
    Field: { kind: "utility" },
    FieldProps: { kind: "utility" },
    useField: { kind: "utility" },
    fieldWidths: { kind: "type" },
    measureField: { kind: "token" },
    FIELD_WASH: { kind: "token" },
  }));
  expect(errors).toContain("Field renders as a component but is classified as utility");
  expect(errors).toContain("FieldProps is type-only but classified as utility");
  expect(errors).toContain("useField is a use* function but classified as utility");
  expect(errors).toContain("fieldWidths has a runtime value but is classified as type");
  expect(errors).toContain("measureField is classified as token but is a function");
  expect(errors).toContain("FIELD_WASH carries @deprecated but is classified as token");
  const misnamed = errorsOf(inventory(), manifest({ ...API, measureField: { kind: "hook" }, fieldWidths: { kind: "component" } }));
  expect(misnamed).toContain("measureField is classified as hook but is not a use* function");
  expect(misnamed).toContain("fieldWidths is classified as component but does not render as a component");
  const unknown = errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "constant" as never } }));
  expect(unknown).toContain("Unknown kind for fieldWidths: constant");
  // Internal helper types and deprecated type aliases are type-only too.
  expect(errorsOf(inventory(), manifest({ ...API, FieldProps: { kind: "internal-by-accident" } }, { pendingDocs: { ...PENDING, FieldProps: FOUNDATION_ROUTE } }))).toEqual([]);
});

test("deprecated aliases match their @deprecated tag and name a live replacement", () => {
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "deprecated-alias" } })))
    .toContain("fieldWidths is classified as deprecated-alias but carries no @deprecated tag");
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { ...API.FIELD_WASH, replacement: "fieldWidth" } })))
    .toContain("FIELD_WASH's replacement is not a public export: fieldWidth");
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { ...API.FIELD_WASH, replacement: "measureField" } })))
    .toContain("FIELD_WASH's replacement measureField is itself internal-by-accident");
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", replacement: "Field" } })))
    .toContain("fieldWidths names a replacement but is not a deprecated alias");
  // A deprecated alias with nothing to replace it (brandColors) is allowed.
  expect(errorsOf(inventory(), manifest({ ...API, FIELD_WASH: { kind: "deprecated-alias" } }))).toEqual([]);
});

test("a deprecated alias's tag says what to use instead, and names its replacement", () => {
  const tagged = (deprecatedText: string) => EXPORTS.map((entry) => (entry.name === "FIELD_WASH" ? { ...entry, deprecatedText } : entry));
  const silent = tagged("");
  expect(errorsOf(inventory({ exports: { web: silent, ios: silent, android: silent } }), manifest()))
    .toEqual(["FIELD_WASH's @deprecated tag says nothing: name what to use instead, or say that nothing replaces it"]);
  // The replacement is named as a whole identifier: `fieldWidth` is not `fieldWidths`.
  const elsewhere = tagged("Use the field's own width prop. It keeps working until a major.");
  expect(errorsOf(inventory({ exports: { web: elsewhere, ios: elsewhere, android: elsewhere } }), manifest()))
    .toEqual(["FIELD_WASH's @deprecated text never names its replacement, fieldWidths"]);
  const near = tagged("Use fieldWidthsScale.");
  expect(errorsOf(inventory({ exports: { web: near, ios: near, android: near } }), manifest()))
    .toEqual(["FIELD_WASH's @deprecated text never names its replacement, fieldWidths"]);
  // With no single replacement, any text that says what to do passes.
  expect(errorsOf(inventory({ exports: { web: elsewhere, ios: elsewhere, android: elsewhere } }), manifest({ ...API, FIELD_WASH: { kind: "deprecated-alias" } }))).toEqual([]);
});

test("a public value owes its consumers a JSDoc summary on the declaration they hover", () => {
  const bare = (name: string, facts: Partial<ApiExport> = {}) => EXPORTS.map((entry) => (entry.name === name ? { ...entry, summary: false, ...facts } : entry));
  for (const [name, kind] of [["Field", "component"], ["useField", "hook"], ["fieldWidths", "token"]] as const) {
    const web = bare(name);
    expect(errorsOf(inventory({ exports: { web, ios: web, android: web } }), manifest()))
      .toEqual([`${name} is a public ${kind} with no JSDoc summary on its declaration (src/field.ts)`]);
  }
  // React Native's own View is documented by its owner: the kit cannot write on its declaration.
  const owned = bare("Field", { files: ["node_modules/react-native/Libraries/Components/View/View.d.ts"] });
  expect(errorsOf(inventory({ exports: { web: owned, ios: owned, android: owned } }), manifest())).toEqual([]);
  // Types carry none, and an internal helper leaves the API as one (measureField has no
  // summary in the fixture).
  const typeOnly = bare("FieldProps");
  expect(errorsOf(inventory({ exports: { web: typeOnly, ios: typeOnly, android: typeOnly } }), manifest())).toEqual([]);
});

test("a deprecated alias says what it was on its declaration, value or type", () => {
  const without = (facts: Partial<ApiExport> = {}) => EXPORTS.map((entry) => (entry.name === "FIELD_WASH" ? { ...entry, summary: false, summaryText: "", ...facts } : entry));
  const bare = without();
  expect(errorsOf(inventory({ exports: { web: bare, ios: bare, android: bare } }), manifest()))
    .toEqual(["FIELD_WASH is a deprecated alias with no JSDoc summary on its declaration (src/field.ts): say what it was"]);
  const typeOnly = without({ value: false });
  expect(errorsOf(inventory({ exports: { web: typeOnly, ios: typeOnly, android: typeOnly } }), manifest()))
    .toEqual(["FIELD_WASH is a deprecated alias with no JSDoc summary on its declaration (src/field.ts): say what it was"]);
  // React Native's own StyleSheet is its owner's to document.
  const owned = without({ files: ["node_modules/react-native/Libraries/StyleSheet/StyleSheet.d.ts"] });
  expect(errorsOf(inventory({ exports: { web: owned, ios: owned, android: owned } }), manifest())).toEqual([]);
});

test("a docs claim names a real route that names the export, and a real section", () => {
  expect(errorsOf(inventory(), manifest({ ...API, Field: { kind: "component", docs: "components/fields" } })))
    .toContain("Unknown docs route for Field: components/fields");
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", docs: "components/field" } }, { pendingDocs: { measureField: FOUNDATION_ROUTE, FIELD_WASH: FOUNDATION_ROUTE }, plannedRoutes: FOUNDATION_ONLY })))
    .toEqual(["Docs route components/field never names fieldWidths in what it renders (components/field.tsx): document it there, or stage it in PENDING_DOCS"]);
  expect(errorsOf(inventory(), manifest({ ...API, Field: { kind: "component", docs: "components/field", section: "Sizes" } })))
    .toEqual(["Docs route components/field has no section \"Sizes\" for Field"]);
  expect(errorsOf(inventory(), manifest({ ...API, fieldWidths: { kind: "token", section: "Hooks" } })))
    .toEqual(["fieldWidths has no docs route but names a section: Hooks"]);
  // `Field` appears inside `FieldProps` and `useField`; only a whole name counts.
  const only = new Map([...PAGES, ["components/field", page("components/field", "FieldProps useField")]]);
  expect(errorsOf(inventory({ pages: only }), manifest({ ...API, Field: { kind: "component", docs: "components/field" }, FieldProps: { kind: "type" } }, { pendingDocs: { ...PENDING, FieldProps: "components/field" }, plannedRoutes: { ...PLANNED, "components/field": { turn: "components/field" } } })))
    .toEqual([
      "Docs route components/field never names Field in what it renders (components/field.tsx): document it there, or stage it in PENDING_DOCS",
      "FieldProps is pending, but its planned page components/field already names it: record docs \"components/field\" and drop it from PENDING_DOCS",
    ]);
});

test("a name that is also an ordinary word is named only where the page shows it as code", () => {
  // `fieldWidths` is camel case: a prose mention names it. `widths` is a word: prose uses it.
  const prose = new Map([...PAGES, ["guides/layout", page("guides/layout", "Layout widths and fieldWidths.", ["Widths"], "")]]);
  const words = { ...API, fieldWidths: { kind: "token" as const, docs: "guides/layout" }, widths: { kind: "token" as const, docs: "guides/layout" } };
  const web = [...EXPORTS, exported("widths")];
  const pending = { measureField: FOUNDATION_ROUTE, FIELD_WASH: FOUNDATION_ROUTE };
  expect(errorsOf(inventory({ pages: prose, exports: { web, ios: web, android: web } }), manifest(words, { pendingDocs: pending, plannedRoutes: FOUNDATION_ONLY })))
    .toEqual(["Docs route guides/layout never names widths in what it renders (guides/layout.tsx): document it there, or stage it in PENDING_DOCS"]);
  const code = new Map([...PAGES, ["guides/layout", page("guides/layout", "Layout widths.\nwidths.md", ["Widths"], "widths.md")]]);
  expect(errorsOf(inventory({ pages: code, exports: { web, ios: web, android: web } }), manifest({ ...words, fieldWidths: { kind: "token" } }, { pendingDocs: { ...pending, fieldWidths: "guides/layout" } }))).toEqual([]);
});

test("PENDING_DOCS stages a name with the route planned for it, and is checked both ways", () => {
  // Every name with no docs route is staged; nothing else is.
  expect(errorsOf(inventory(), manifest(API, { pendingDocs: { measureField: FOUNDATION_ROUTE, FIELD_WASH: FOUNDATION_ROUTE }, plannedRoutes: FOUNDATION_ONLY })))
    .toEqual(["fieldWidths has no docs route and is not in PENDING_DOCS: document it, or stage it there with the route planned for it"]);
  expect(errorsOf(inventory(), manifest(API, { pendingDocs: { ...PENDING, Field: "components/field" }, plannedRoutes: { ...PLANNED, "components/field": { turn: "components/field" } } })))
    .toEqual(["PENDING_DOCS entry Field already has a docs route (components/field): drop it from PENDING_DOCS"]);
  expect(errorsOf(inventory(), manifest(API, { pendingDocs: { ...PENDING, FieldGroup: "guides/layout" } })))
    .toEqual(["PENDING_DOCS names FieldGroup, which the manifest does not classify"]);
  expect(errorsOf(inventory(), manifest(API, { pendingDocs: { ...PENDING, fieldWidths: "guides/sizes" }, plannedRoutes: { ...FOUNDATION_ONLY, "guides/sizes": { turn: "components/field" } } })))
    .toEqual(["Unknown planned docs route for fieldWidths: guides/sizes"]);
  // The day the planned page names a staged name, the gate asks for the move.
  const named = new Map([...PAGES, ["guides/layout", page("guides/layout", "Read fieldWidths for the scale.", ["Widths"])]]);
  expect(errorsOf(inventory({ pages: named }), manifest()))
    .toEqual(["fieldWidths is pending, but its planned page guides/layout already names it: record docs \"guides/layout\" and drop it from PENDING_DOCS"]);
  // A file is staged the same way.
  expect(errorsOf(inventory(), manifest(API, { files: { "styles/field.css": { kind: "token" } } })))
    .toEqual(["styles/field.css has no docs route and is not in PENDING_DOCS: document it, or stage it there with the route planned for it"]);
});

test("the staged migration ends route by route, at the audit turn that owns each route", () => {
  // A staged route names the turn that ends it.
  expect(errorsOf(inventory(), manifest(API, { plannedRoutes: { [FOUNDATION_ROUTE]: PLANNED[FOUNDATION_ROUTE] } })))
    .toEqual(["PENDING_DOCS stages 1 (fieldWidths) for guides/layout, but PLANNED_ROUTES names no audit turn that lands its docs: give the route the turn that ends it"]);
  expect(errorsOf(inventory(), manifest(API, { plannedRoutes: { ...PLANNED, "guides/layout": { turn: "components/fields" } } })))
    .toEqual(["PLANNED_ROUTES gives guides/layout to components/fields, which is no checklist under audit/"]);
  // Its turn closes it, and nothing may be staged for a closed route again.
  expect(errorsOf(inventory(), manifest(API, { plannedRoutes: { ...PLANNED, "guides/layout": { turn: "components/field", closed: true } } })))
    .toEqual(["guides/layout is closed (its turn, components/field, landed its docs), but PENDING_DOCS still stages 1 (fieldWidths) for it: document them there"]);
  // A route nothing is staged for any more is closed, so its staging cannot reopen quietly.
  const documented = new Map([...PAGES, ["guides/layout", page("guides/layout", "Layout widths: fieldWidths.", ["Widths"])]]);
  const moved = { ...API, fieldWidths: { kind: "token" as const, docs: "guides/layout" } };
  const rest = { measureField: FOUNDATION_ROUTE, FIELD_WASH: FOUNDATION_ROUTE };
  expect(errorsOf(inventory({ pages: documented }), manifest(moved, { pendingDocs: rest })))
    .toEqual(["Nothing is staged for guides/layout any more: its turn (components/field) closes it in PLANNED_ROUTES (closed: true)"]);
  expect(errorsOf(inventory({ pages: documented }), manifest(moved, { pendingDocs: rest, plannedRoutes: { ...PLANNED, "guides/layout": { turn: "components/field", closed: true } } }))).toEqual([]);
  expect(errorsOf(inventory(), manifest(API, { plannedRoutes: { ...PLANNED, "guides/sizes": { turn: "components/field", closed: true } } })))
    .toEqual(["PLANNED_ROUTES closes guides/sizes, which the docs do not serve"]);
  // The foundation reference existing ends no other route: guides/layout stays staged, and
  // an internal helper a later turn retires stays staged for the reference too.
  const withFoundation = new Map([...PAGES, [FOUNDATION_ROUTE, page(FOUNDATION_ROUTE, "Deprecated names: FIELD_WASH.")]]);
  const aliasHome = { ...API, FIELD_WASH: { ...API.FIELD_WASH, docs: FOUNDATION_ROUTE } };
  expect(errorsOf(inventory({ pages: withFoundation }), manifest(aliasHome, { pendingDocs: { fieldWidths: "guides/layout", measureField: FOUNDATION_ROUTE } }))).toEqual([]);
});

test("the foundation reference is every deprecated alias's home, and lists each once it exists", () => {
  // Before the page exists, an alias waits for it there and nowhere else.
  expect(errorsOf(inventory(), manifest(API, { pendingDocs: { ...PENDING, FIELD_WASH: "guides/layout" } })))
    .toEqual(["FIELD_WASH is a deprecated alias staged for guides/layout: its home is the foundation reference (foundation)"]);
  expect(errorsOf(inventory({ pages: new Map([...PAGES, ["guides/layout", page("guides/layout", "FIELD_WASH fieldWidths")]]) }), manifest({ ...API, FIELD_WASH: { ...API.FIELD_WASH, docs: "guides/layout" } }, { pendingDocs: { fieldWidths: "guides/layout", measureField: FOUNDATION_ROUTE } })))
    .toContain("FIELD_WASH is a deprecated alias documented on guides/layout: its home is the foundation reference (foundation)");
  // Once it exists, a staged alias it names is moved to docs, and one it leaves out fails.
  const listing = new Map([...PAGES, [FOUNDATION_ROUTE, page(FOUNDATION_ROUTE, "Deprecated names: FIELD_WASH.")]]);
  expect(errorsOf(inventory({ pages: listing }), manifest()))
    .toEqual([`FIELD_WASH is pending, but its planned page ${FOUNDATION_ROUTE} already names it: record docs "${FOUNDATION_ROUTE}" and drop it from PENDING_DOCS`]);
  const silent = new Map([...PAGES, [FOUNDATION_ROUTE, page(FOUNDATION_ROUTE, "Deprecated names.")]]);
  expect(errorsOf(inventory({ pages: silent }), manifest()))
    .toEqual([`FIELD_WASH is a deprecated alias, and the foundation reference (${FOUNDATION_ROUTE}) does not list it: every deprecated name is listed there with its replacement`]);
});

test("the materials manifest and the API manifest agree on a renderable's docs route", () => {
  const routes = (route: string | null, name = "Field") => new Map([[name, route]]);
  expect(errorsOf(inventory({ materialRoutes: routes("guides/fields") }), manifest()))
    .toEqual(["The materials manifest gives Field the docs route guides/fields, but the API manifest documents it at components/field"]);
  expect(errorsOf(inventory({ materialRoutes: routes(null) }), manifest()))
    .toEqual(["The materials manifest gives Field the docs route null, but the API manifest documents it at components/field"]);
  // While the docs are pending, the material inventory names no route or the planned one.
  const pending = { ...API, Field: { kind: "component" as const } };
  const staged = { pendingDocs: { ...PENDING, Field: "guides/layout" } };
  expect(errorsOf(inventory({ materialRoutes: routes(null) }), manifest(pending, staged))).toEqual([]);
  expect(errorsOf(inventory({ materialRoutes: routes("guides/layout") }), manifest(pending, staged))).toEqual([]);
  expect(errorsOf(inventory({ materialRoutes: routes("guides/fields") }), manifest(pending, staged)))
    .toEqual(["The materials manifest gives Field the docs route guides/fields, but its API docs are pending (planned for guides/layout): record null or the planned route"]);
  // A compound member the material inventory records has no export entry of its own.
  expect(errorsOf(inventory({ materialRoutes: routes("components/field", "Field.Label") }), manifest())).toEqual([]);
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
  expect(wrong).toContain("Docs route components/field never names styles/field.css in what it renders (components/field.tsx): document it there, or stage it in PENDING_DOCS");
});
