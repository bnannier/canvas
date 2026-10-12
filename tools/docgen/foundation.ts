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
//
// The page lists them in sections, one per family of internals. A name's section is its
// manifest `section` (which check:api holds to a heading of the page); FOUNDATION_SECTIONS
// below gives the sections' order and the line under each title, and the generator fails
// on a deprecated alias whose section is missing or unlisted, and on a listed section
// that lists nothing.

import { resolve } from "node:path";
import { ENTRY_FILE, entryProgram, moduleExports } from "../api/discover.ts";
import { publicApi } from "../api/manifest.ts";
import type { ApiEntry, ApiExport } from "../api/types.ts";

/** The module docs:gen writes, repo-relative. */
export const FOUNDATION_MODULE = "docs/src/core/foundation-reference.ts";

/** One section of the page: its title (a deprecated alias's manifest `section`) and the line under it. */
export interface FoundationSection {
  title: string;
  about: string;
}

/** The page's sections, in page order. */
export const FOUNDATION_SECTIONS: readonly FoundationSection[] = [
  { title: "Overlay machinery", about: "The anchored card behind Popover, Dropdown, Select, Autocomplete and the other menus and option lists, and the placement and side its decorations read." },
  { title: "Entrance", about: "The readiness hold an anchored card applies to itself until its placement is measured." },
  { title: "Field label", about: "The label of the field family: Android's floating label, the label text with its required marker, the slice of a field skin that places it, and the props that hide decorative content." },
  { title: "Viewport tier", about: "The bucket a server render assumes, and React Native's own window hook." },
  { title: "Focus and keyboard", about: "The focus-ring reset, the field indicator, the roving arrow keys, dialog and popover focus, and the Escape and Android back that close overlays." },
  { title: "Touch target", about: "The platform minimum touch target (44 pt on iOS, 48 dp on Android) the kit's controls extend their touch area to." },
  { title: "Press feedback", about: "The Android ripple and the iOS and web press and disabled dims the kit's controls show." },
  { title: "Glass fills", about: "The fills the kit's components paint inside a glass surface, and whether glass paints at all." },
  { title: "Motion", about: "The native-driver gate and the loop easings behind the kit's functional motion." },
  { title: "Gestures", about: "GeoMap's wheel and pinch zoom." },
  { title: "Type and colour", about: "Tabular figures, the theme's typefaces, the monospace face, and colour values the kit no longer paints with." },
  { title: "Layout", about: "Container's and Grid's own layout math, and the layout direction." },
  { title: "State and warnings", about: "The controlled and uncontrolled state every kit control shares, and the kit's development warnings." },
  { title: "CodeBlock internals", about: "CodeBlock's own syntax highlighter." },
  { title: "DashboardGrid internals", about: "DashboardGrid's tiers, spans and reorder logic." },
  { title: "React Native pass-throughs", about: "React Native's own names, re-exported unchanged." },
];

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

/** A section of the page with its rows. */
export interface DeprecatedSection extends FoundationSection {
  names: Omit<DeprecatedRow, "section">[];
}

/**
 * The rows by section, in the sections' order: every row in the section its manifest entry
 * names, and every section listing at least one.
 */
export function deprecatedSections(rows: readonly DeprecatedRow[], sections: readonly FoundationSection[] = FOUNDATION_SECTIONS): DeprecatedSection[] {
  const titles = new Set(sections.map((section) => section.title));
  for (const row of rows) {
    if (row.section === null) throw new Error(`docs:gen: the deprecated alias ${row.name} names no section in tools/api/manifest.ts: give it docs "foundation" and the section it belongs to`);
    if (!titles.has(row.section)) throw new Error(`docs:gen: the deprecated alias ${row.name} names the section "${row.section}", which tools/docgen/foundation.ts FOUNDATION_SECTIONS does not list`);
  }
  return sections.map((section) => {
    const names = rows.filter((row) => row.section === section.title).map(({ section: _section, ...row }) => row);
    if (!names.length) throw new Error(`docs:gen: the foundation reference's section "${section.title}" lists no deprecated name: drop it from FOUNDATION_SECTIONS`);
    return { ...section, names };
  });
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
export function renderFoundationModule(sections: readonly DeprecatedSection[], header: string): string {
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
}

/** The title of one of the page's sections. */
export type DeprecatedSectionTitle = ${sections.map((section) => JSON.stringify(section.title)).join(" | ")};

export interface DeprecatedSection {
  /** The section's heading. */
  title: DeprecatedSectionTitle;
  /** The line under the heading. */
  about: string;
  /** Its deprecated names, in name order. */
  names: DeprecatedName[];
}

export const DEPRECATED_SECTIONS: DeprecatedSection[] = ${JSON.stringify(sections, null, 2)};
`;
}
