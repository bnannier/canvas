import { names } from "./docs";
import { API_KINDS, type ApiEntry, type ApiExport, type ApiKind, type DocsPage, type DocsRoute, type EntryPointShape, type Resolution } from "./types";

/**
 * The generated foundation reference (audit K12-10): the planned home of every pending
 * name that no narrative page takes, and the end of the staged docs migration. Once the
 * route exists, PENDING_DOCS must be empty.
 */
export const FOUNDATION_ROUTE = "foundation";

// Which kinds each shape of export may take. A stylesheet is a file, so it cannot be a
// type, a hook or a component, and it cannot carry a `@deprecated` tag.
const RENDERABLE_KINDS = new Set<ApiKind>(["component", "part", "deprecated-alias", "internal-by-accident"]);
const TYPE_ONLY_KINDS = new Set<ApiKind>(["type", "deprecated-alias", "internal-by-accident"]);
const HOOK_NAMED_KINDS = new Set<ApiKind>(["hook", "deprecated-alias", "internal-by-accident"]);
const STYLESHEET_KINDS = new Set<ApiKind>(["token", "part", "utility", "internal-by-accident"]);
// The values a consumer is meant to use, each of which owes them a JSDoc summary. A
// deprecated alias speaks through its `@deprecated` text; an internal helper leaves the
// API as one.
const PUBLIC_VALUE_KINDS = new Set<ApiKind>(["component", "part", "hook", "token", "utility"]);

// Facts that must not differ between the web build and a native resolution: a platform
// fork that turns a component into something else, or deprecates it on one OS, changes
// the API there.
const PARITY = {
  value: ["a value", "type-only"],
  renderable: ["a component", "not a component"],
  callable: ["callable", "not callable"],
  deprecated: ["@deprecated", "not @deprecated"],
} as const satisfies Record<string, readonly [string, string]>;

export interface ApiInventory {
  /** package.json `name`: a file is documented where a page shows `<name>/<path>`. */
  packageName: string;
  /** The package entry's exports under each resolution (tools/api/discover.ts). */
  exports: Record<Resolution, readonly ApiExport[]>;
  /** The subpaths of package.json `exports`. */
  packageEntryPoints: readonly string[];
  /** Repo-relative files each `files` entry point publishes, by subpath. */
  entryPointFiles: Record<string, readonly string[]>;
  pages: ReadonlyMap<string, DocsPage>;
  /** The docs route the material inventory (tools/materials/manifest.ts) records for each renderable. */
  materialRoutes: ReadonlyMap<string, string | null>;
}

export interface ApiManifest {
  entryPoints: Readonly<Record<string, EntryPointShape>>;
  publicApi: Readonly<Record<string, ApiEntry>>;
  /** Files reached by the `files` entry points, keyed by repo-relative path. */
  files: Readonly<Record<string, ApiEntry>>;
  /** Exports and files whose docs are pending, each with the route planned for it. */
  pendingDocs: Readonly<Record<string, DocsRoute>>;
}

function own<T>(record: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

function checkDocs(subject: string, entry: ApiEntry, named: (page: DocsPage) => boolean, inventory: ApiInventory, manifest: ApiManifest, errors: string[]) {
  const planned = own(manifest.pendingDocs, subject);
  if (entry.docs === undefined) {
    if (entry.section !== undefined) errors.push(`${subject} has no docs route but names a section: ${entry.section}`);
    if (planned === undefined) {
      errors.push(`${subject} has no docs route and is not in PENDING_DOCS: document it, or stage it there with the route planned for it`);
      return;
    }
    // Staged, not waived: the gate notices the day the planned page names it.
    const page = inventory.pages.get(planned);
    if (!page && planned !== FOUNDATION_ROUTE) errors.push(`Unknown planned docs route for ${subject}: ${planned}`);
    else if (page && named(page)) errors.push(`${subject} is pending, but its planned page ${planned} already names it: record docs "${planned}" and drop it from PENDING_DOCS`);
    return;
  }
  if (planned !== undefined) errors.push(`PENDING_DOCS entry ${subject} already has a docs route (${entry.docs}): drop it from PENDING_DOCS`);
  const page = inventory.pages.get(entry.docs);
  if (!page) {
    errors.push(`Unknown docs route for ${subject}: ${entry.docs}`);
    return;
  }
  if (!named(page)) errors.push(`Docs route ${entry.docs} never names ${subject} in what it renders (${page.sources.join(", ")}): document it there, or stage it in PENDING_DOCS`);
  if (entry.section !== undefined && !page.headings.includes(entry.section)) errors.push(`Docs route ${entry.docs} has no section "${entry.section}" for ${subject}`);
}

/** A declaration the kit does not own (React Native's View): its owner writes its docs. */
function dependencyOwned(api: ApiExport): boolean {
  return api.files.length > 0 && api.files.every((file) => /(^|\/)node_modules\//.test(file));
}

/** The public API gate: every export classified, every claim of documentation true. Pure. */
export function checkPublicApi(inventory: ApiInventory, manifest: ApiManifest) {
  const errors: string[] = [];
  const web = new Map(inventory.exports.web.map((entry) => [entry.name, entry]));

  // The entry points themselves: a new subpath is a new public surface.
  const declaredPoints = Object.keys(manifest.entryPoints);
  for (const point of inventory.packageEntryPoints) if (!declaredPoints.includes(point)) errors.push(`Unclassified package entry point: ${point}`);
  for (const point of declaredPoints) if (!inventory.packageEntryPoints.includes(point)) errors.push(`Removed package entry point still classified: ${point}`);
  // The checker reads one module entry, src/index.ts behind ".": another would go unread.
  for (const [point, shape] of Object.entries(manifest.entryPoints)) {
    if (shape === "module" && point !== ".") errors.push(`Entry point ${point} is a module, but the gate reads only "." (src/index.ts): teach tools/api/discover.ts its entry first`);
  }

  // dist/native resolves each platform's sibling files, so its export set and each
  // export's facts are checked against the web build's: a fork that drops, adds or
  // reshapes a name changes the API on one OS.
  for (const resolution of ["ios", "android"] as const) {
    const native = new Map(inventory.exports[resolution].map((entry) => [entry.name, entry]));
    for (const [name, entry] of web) {
      const other = native.get(name);
      if (!other) {
        errors.push(`${name} is exported on the web but not on ${resolution}`);
        continue;
      }
      for (const [fact, [yes, no]] of Object.entries(PARITY) as [keyof typeof PARITY, readonly [string, string]][]) {
        if (other[fact] !== entry[fact]) errors.push(`${name} is ${entry[fact] ? yes : no} on the web but ${other[fact] ? yes : no} on ${resolution}`);
      }
    }
    for (const name of native.keys()) if (!web.has(name)) errors.push(`${name} is exported on ${resolution} but not on the web`);
  }

  for (const [name, entry] of Object.entries(manifest.publicApi)) {
    if (!API_KINDS.includes(entry.kind)) errors.push(`Unknown kind for ${name}: ${entry.kind}`);
    const api = web.get(name);
    if (!api) {
      errors.push(`Removed export still classified: ${name}`);
      continue;
    }
    // The kind has to agree with what the checker sees in the source.
    if (!api.value && !TYPE_ONLY_KINDS.has(entry.kind)) errors.push(`${name} is type-only but classified as ${entry.kind}`);
    if (api.value && entry.kind === "type") errors.push(`${name} has a runtime value but is classified as type`);
    if (api.renderable && !RENDERABLE_KINDS.has(entry.kind)) errors.push(`${name} renders as a component but is classified as ${entry.kind}`);
    if ((entry.kind === "component" || entry.kind === "part") && !api.renderable) errors.push(`${name} is classified as ${entry.kind} but does not render as a component`);
    const hookNamed = /^use[A-Z0-9]/.test(name);
    if (entry.kind === "hook" && !(hookNamed && api.callable)) errors.push(`${name} is classified as hook but is not a use* function`);
    if (hookNamed && api.callable && !HOOK_NAMED_KINDS.has(entry.kind)) errors.push(`${name} is a use* function but classified as ${entry.kind}`);
    if (entry.kind === "token" && (api.callable || api.renderable)) errors.push(`${name} is classified as token but is a function`);
    if (api.deprecated && entry.kind !== "deprecated-alias") errors.push(`${name} carries @deprecated but is classified as ${entry.kind}`);
    if (entry.kind === "deprecated-alias" && !api.deprecated) errors.push(`${name} is classified as deprecated-alias but carries no @deprecated tag`);
    if (entry.replacement !== undefined) {
      const replacement = own(manifest.publicApi, entry.replacement);
      if (entry.kind !== "deprecated-alias") errors.push(`${name} names a replacement but is not a deprecated alias`);
      else if (!replacement || !web.has(entry.replacement)) errors.push(`${name}'s replacement is not a public export: ${entry.replacement}`);
      else if (replacement.kind === "deprecated-alias" || replacement.kind === "internal-by-accident") errors.push(`${name}'s replacement ${entry.replacement} is itself ${replacement.kind}`);
    }
    // What hover shows a consumer. The published declarations are the web build's
    // (package.json `types`), so the web resolution is the one that counts.
    if (PUBLIC_VALUE_KINDS.has(entry.kind) && api.value && !api.summary && !dependencyOwned(api)) {
      errors.push(`${name} is a public ${entry.kind} with no JSDoc summary on its declaration (${api.files.join(", ")})`);
    }
    checkDocs(name, entry, (page) => names(page, name), inventory, manifest, errors);
  }
  for (const name of web.keys()) if (!Object.hasOwn(manifest.publicApi, name)) errors.push(`Unclassified export: ${name}`);

  const reached = new Set<string>();
  for (const [point, shape] of Object.entries(manifest.entryPoints)) {
    if (shape !== "files") continue;
    for (const file of inventory.entryPointFiles[point] ?? []) reached.add(file);
  }
  for (const [file, entry] of Object.entries(manifest.files)) {
    if (!STYLESHEET_KINDS.has(entry.kind)) errors.push(`${file} is a file but classified as ${entry.kind}`);
    if (entry.replacement !== undefined) errors.push(`${file} names a replacement, which only a deprecated alias carries`);
    if (!reached.has(file)) errors.push(`Removed file still classified: ${file}`);
    // A file is documented where the page shows its import specifier.
    checkDocs(file, entry, (page) => page.text.includes(`${inventory.packageName}/${file}`), inventory, manifest, errors);
  }
  for (const file of reached) if (!Object.hasOwn(manifest.files, file)) errors.push(`Unclassified file reached by a package entry point: ${file}`);

  const pending = Object.keys(manifest.pendingDocs);
  for (const subject of pending) {
    if (!Object.hasOwn(manifest.publicApi, subject) && !Object.hasOwn(manifest.files, subject)) errors.push(`PENDING_DOCS names ${subject}, which the manifest does not classify`);
  }
  if (inventory.pages.has(FOUNDATION_ROUTE) && pending.length) {
    errors.push(`The foundation reference (${FOUNDATION_ROUTE}) exists, so the staged migration is over: PENDING_DOCS still holds ${pending.length} (${pending.slice(0, 5).join(", ")}${pending.length > 5 ? ", ..." : ""})`);
  }

  // The material inventory names a docs route for every renderable too, and the two
  // manifests must agree on it: the documenting route, or while the docs are pending,
  // none or the planned one (a component part's family page, which the material
  // inventory requires).
  for (const [name, route] of inventory.materialRoutes) {
    const entry = own(manifest.publicApi, name);
    if (!entry) continue;
    if (entry.docs !== undefined) {
      if (route !== entry.docs) errors.push(`The materials manifest gives ${name} the docs route ${route ?? "null"}, but the API manifest documents it at ${entry.docs}`);
      continue;
    }
    const planned = own(manifest.pendingDocs, name);
    if (route !== null && route !== planned) errors.push(`The materials manifest gives ${name} the docs route ${route}, but its API docs are pending${planned ? ` (planned for ${planned})` : ""}: record null or the planned route`);
  }

  const kinds = Object.fromEntries(API_KINDS.map((kind) => [kind, Object.values(manifest.publicApi).filter((entry) => entry.kind === kind).length]));
  const documented = Object.values(manifest.publicApi).filter((entry) => entry.docs !== undefined).length;
  return {
    errors,
    exports: web.size,
    kinds,
    documented,
    pending: pending.length,
    files: reached.size,
    entryPoints: declaredPoints.length,
  };
}
