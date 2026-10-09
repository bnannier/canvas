import { mentions } from "./docs";
import { API_KINDS, type ApiEntry, type ApiExport, type ApiKind, type DocsPage, type EntryPointShape, type Resolution } from "./types";

const UNDOCUMENTED = "undocumented";

// Which kinds each shape of export may take. A stylesheet is a file, so it cannot be a
// type, a hook or a component, and it cannot carry a `@deprecated` tag.
const RENDERABLE_KINDS = new Set<ApiKind>(["component", "part", "deprecated-alias", "internal-by-accident"]);
const TYPE_ONLY_KINDS = new Set<ApiKind>(["type", "deprecated-alias", "internal-by-accident"]);
const HOOK_NAMED_KINDS = new Set<ApiKind>(["hook", "deprecated-alias", "internal-by-accident"]);
const STYLESHEET_KINDS = new Set<ApiKind>(["token", "part", "utility", "internal-by-accident"]);

export interface ApiInventory {
  /** package.json `name`: a file is documented where a page shows `<name>/<path>`. */
  packageName: string;
  /** The package entry's exports under each resolution (tools/api/discover.ts). */
  exports: Record<Resolution, readonly ApiExport[]>;
  /** The subpaths of package.json `exports`. */
  packageEntryPoints: readonly string[];
  /** Repo-relative files each `files` entry point reaches, by subpath. */
  entryPointFiles: Record<string, readonly string[]>;
  pages: ReadonlyMap<string, DocsPage>;
}

export interface ApiManifest {
  entryPoints: Readonly<Record<string, EntryPointShape>>;
  publicApi: Readonly<Record<string, ApiEntry>>;
  /** Files reached by the `files` entry points, keyed by repo-relative path. */
  files: Readonly<Record<string, ApiEntry>>;
}

function checkDocs(subject: string, entry: ApiEntry, mentioned: (page: DocsPage) => boolean, pages: ReadonlyMap<string, DocsPage>, errors: string[]) {
  if (entry.docs === UNDOCUMENTED) {
    if (entry.section !== undefined) errors.push(`${subject} is undocumented but names a section: ${entry.section}`);
    return;
  }
  const page = pages.get(entry.docs);
  if (!page) {
    errors.push(`Unknown docs route for ${subject}: ${entry.docs}`);
    return;
  }
  if (!mentioned(page)) errors.push(`Docs route ${entry.docs} never names ${subject} in what it renders (${page.sources.join(", ")}): record it as undocumented, or document it there`);
  if (entry.section !== undefined && !page.headings.includes(entry.section)) errors.push(`Docs route ${entry.docs} has no section "${entry.section}" for ${subject}`);
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

  // dist/native resolves each platform's sibling files, so its export set is checked
  // against the web build's: a fork that drops or adds a name changes the API on one OS.
  for (const resolution of ["ios", "android"] as const) {
    const native = new Map(inventory.exports[resolution].map((entry) => [entry.name, entry]));
    for (const [name, entry] of web) {
      const other = native.get(name);
      if (!other) errors.push(`${name} is exported on the web but not on ${resolution}`);
      else if (other.value !== entry.value) errors.push(`${name} is ${entry.value ? "a value" : "type-only"} on the web but ${other.value ? "a value" : "type-only"} on ${resolution}`);
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
      const replacement = Object.hasOwn(manifest.publicApi, entry.replacement) ? manifest.publicApi[entry.replacement] : undefined;
      if (entry.kind !== "deprecated-alias") errors.push(`${name} names a replacement but is not a deprecated alias`);
      else if (!replacement || !web.has(entry.replacement)) errors.push(`${name}'s replacement is not a public export: ${entry.replacement}`);
      else if (replacement.kind === "deprecated-alias" || replacement.kind === "internal-by-accident") errors.push(`${name}'s replacement ${entry.replacement} is itself ${replacement.kind}`);
    }
    checkDocs(name, entry, (page) => mentions(page.text, name), inventory.pages, errors);
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
    checkDocs(file, entry, (page) => page.text.includes(`${inventory.packageName}/${file}`), inventory.pages, errors);
  }
  for (const file of reached) if (!Object.hasOwn(manifest.files, file)) errors.push(`Unclassified file reached by a package entry point: ${file}`);

  const kinds = Object.fromEntries(API_KINDS.map((kind) => [kind, Object.values(manifest.publicApi).filter((entry) => entry.kind === kind).length]));
  const documented = Object.values(manifest.publicApi).filter((entry) => entry.docs !== UNDOCUMENTED).length;
  return {
    errors,
    exports: web.size,
    kinds,
    documented,
    undocumented: Object.keys(manifest.publicApi).length - documented,
    files: reached.size,
    entryPoints: declaredPoints.length,
  };
}
