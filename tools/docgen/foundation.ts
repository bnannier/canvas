// The generated foundation reference's data (audit K12-10, the owner's OD2 decision): every
// deprecated name of the package, what it was, and what to use instead, written by
// `bun run docs:gen` to docs/src/core/foundation-reference.ts for the /foundation page.
//
// Nothing here is written by hand twice. tools/api/manifest.ts says which exports are
// deprecated aliases, the public name that replaces each one when one does, and that name's
// docs route; the source says the rest, read through the TypeScript checker the way the
// public API gate reads it (tools/api/discover.ts): the declaration's JSDoc summary, which
// is what the name was, and the `@deprecated` text, which says what to use instead. So the
// page cannot drift from the manifest or the source: `docs:gen --check` fails when the
// module is stale, and `check:api` reads the module as part of the page (tools/api/docs.ts),
// so the page lists every deprecated alias it claims to.

import { resolve } from "node:path";
import { ENTRY_FILE, entryProgram, moduleExports } from "../api/discover.ts";
import { publicApi } from "../api/manifest.ts";
import type { ApiEntry, ApiExport } from "../api/types.ts";

/** The module docs:gen writes, repo-relative. */
export const FOUNDATION_MODULE = "docs/src/core/foundation-reference.ts";

/** One deprecated name as the page shows it. */
export interface DeprecatedRow {
  name: string;
  /** A type-only export. */
  type: boolean;
  /** What it was: the first sentence of its declaration's summary. */
  summary: string;
  /** What to use instead: its `@deprecated` text. */
  instead: string;
  /** The public name that replaces it, when a single one does. */
  replacement: string | null;
  /** That name's docs route, when a page documents it. */
  replacementRoute: string | null;
  /** The page section it is listed under (its manifest `section`), or null before it has one. */
  section: string | null;
}

/**
 * The first sentence of a summary, on one line: a summary's later sentences and paragraphs
 * are the contract's detail, which the declaration keeps. A sentence ends at a full stop,
 * question or exclamation mark followed by a space and a capital letter or the end, never
 * inside parentheses or a code span. A sentence may open on a lowercase brand (iOS).
 */
export function firstSentence(summary: string): string {
  const text = summary.split(/\n\s*\n/)[0]!.replace(/\s+/g, " ").trim();
  let depth = 0;
  let code = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "`") code = !code;
    else if (!code && c === "(") depth++;
    else if (!code && c === ")") depth = Math.max(0, depth - 1);
    else if (!code && depth === 0 && /[.!?]/.test(c!) && (i === text.length - 1 || /^ ([A-Z`"]|i[A-Z])/.test(text.slice(i + 1, i + 4)))) return text.slice(0, i + 1);
  }
  return text;
}

/** The package a dependency-owned declaration comes from (`react-native`), or null for the kit's own. */
function owningPackage(api: ApiExport): string | null {
  // The last node_modules segment names the package: a store layout nests the real one
  // (`node_modules/.bun/react-native@0.86.0/node_modules/react-native/...`).
  for (const file of api.files) {
    const packages = [...file.matchAll(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)\//g)].map((match) => match[1]);
    if (packages.length) return packages[packages.length - 1]!;
  }
  return null;
}

/**
 * What a deprecated name was. The kit's own names say it in their summary; a dependency's
 * name (React Native's StyleSheet) is that dependency's to document, so the row says whose
 * it is.
 */
function whatItWas(api: ApiExport): string {
  const owner = owningPackage(api);
  if (owner) return owner === "react-native" ? `React Native's own ${api.name}, re-exported unchanged.` : `The ${owner} package's own ${api.name}, re-exported unchanged.`;
  return firstSentence(api.summaryText);
}

/** Every deprecated alias the manifest records, from the export facts of the package entry (the web build's). */
export function deprecatedRows(exports: readonly ApiExport[], api: Readonly<Record<string, ApiEntry>> = publicApi): DeprecatedRow[] {
  const facts = new Map(exports.map((entry) => [entry.name, entry]));
  return Object.entries(api)
    .filter(([, entry]) => entry.kind === "deprecated-alias")
    .map(([name, entry]) => {
      const fact = facts.get(name);
      if (!fact) throw new Error(`docs:gen: tools/api/manifest.ts records the deprecated alias ${name}, which the package entry does not export (run bun run check:api)`);
      const replacement = entry.replacement ?? null;
      return {
        name,
        type: !fact.value,
        summary: whatItWas(fact),
        instead: fact.deprecatedText,
        replacement,
        replacementRoute: replacement ? api[replacement]?.docs ?? null : null,
        section: entry.section ?? null,
      };
    })
    .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0));
}

/** The rows from the source: the package entry's web build, as the published types show it. */
export function readDeprecatedRows(root: string): DeprecatedRow[] {
  return deprecatedRows(moduleExports(entryProgram(root, "web"), resolve(root, ENTRY_FILE), root));
}

/** The generated module's text. */
export function renderFoundationModule(rows: readonly DeprecatedRow[], header: string): string {
  return `${header}
// The deprecated names of @nannier/canvas, for the /foundation reference (audit K12-10):
// written by tools/docgen/foundation.ts from tools/api/manifest.ts (which names are
// deprecated aliases, their replacements and those names' docs routes) and the source
// (each declaration's summary and its @deprecated text).

export interface DeprecatedName {
  /** The export's name. */
  name: string;
  /** A type-only export. */
  type: boolean;
  /** What it was: the first sentence of its declaration's summary. */
  summary: string;
  /** What to use instead: its @deprecated text, inline Markdown. */
  instead: string;
  /** The public name that replaces it, when a single one does. */
  replacement: string | null;
  /** That name's docs route, when a page documents it. */
  replacementRoute: string | null;
  /** The page section it is listed under, or null before it has one. */
  section: string | null;
}

export const DEPRECATED_NAMES: DeprecatedName[] = ${JSON.stringify(rows, null, 2)};
`;
}
