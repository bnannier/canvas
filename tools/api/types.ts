// Tooling metadata for the public API manifest. Nothing here ships in the package.

/**
 * What a public name is, read from its source:
 *
 * - `component`: a renderable with a job of its own (it has, or is meant to have, its
 *   own reference page).
 * - `part`: a renderable or stylesheet that exists to sit inside another public unit
 *   (a compound child, a provider a component needs, a token file canvas.css imports).
 * - `hook`: a `use*` function a consumer calls from a component.
 * - `token`: design values: colors, spacing, type, radii, widths and the like.
 * - `utility`: any other value a consumer may call or read (theme helpers, math,
 *   platform capability checks, context objects).
 * - `type`: a type-only export.
 * - `deprecated-alias`: a name carrying `@deprecated`, kept working until a major.
 * - `internal-by-accident`: a kit-internal helper that is public only because a
 *   barrel re-exports its module wholesale. Recording it is not a deprecation: that
 *   decision belongs to the owner.
 */
export type ApiKind =
  | "component"
  | "part"
  | "hook"
  | "token"
  | "utility"
  | "type"
  | "deprecated-alias"
  | "internal-by-accident";

export const API_KINDS: readonly ApiKind[] = [
  "component", "part", "hook", "token", "utility", "type", "deprecated-alias", "internal-by-accident",
];

/** A docs route as the docs app serves it, without the leading slash (`components/grid`, `theming`). */
export type DocsRoute = string;

export interface ApiEntry {
  kind: ApiKind;
  /**
   * Where the docs site documents the name: a route whose rendered text names it, or
   * `undocumented` when no page does. Never a page that only uses the name.
   */
  docs: DocsRoute | "undocumented";
  /** A heading on that page (a `<Section>` title, an H2/H3, an example or Do & Don't title). */
  section?: string;
  /** For a deprecated alias: the public name to use instead, when one exists. */
  replacement?: string;
}

/** The three resolutions of the package entry `.`: dist/index.js, and dist/native under Metro on each OS. */
export type Resolution = "web" | "ios" | "android";

export interface ApiExport {
  name: string;
  /** Has a runtime binding; false for a type-only export. */
  value: boolean;
  /** Renders as a React component (the definition the material inventory uses). */
  renderable: boolean;
  /** A callable value that is not a component: a function or hook. */
  callable: boolean;
  /** Its declaration or its re-export carries `@deprecated`. */
  deprecated: boolean;
  /** Repo-relative declaration files, including dependency-owned ones. */
  files: string[];
}

/** How the gate enumerates each subpath of package.json `exports`. */
export type EntryPointShape =
  /** Named JS/TS exports, classified one by one in `publicApi`. */
  | "module"
  /** Every file the pattern reaches, classified one by one in `stylesheets`. */
  | "files"
  /** Package metadata; it carries no API. */
  | "metadata";

/** One page of the docs app: its route, the text it renders, and its headings. */
export interface DocsPage {
  route: DocsRoute;
  /** Repo-relative files whose rendered text the page shows. */
  sources: string[];
  /** String literals, template text and JSX text: what a reader can see, never an import or a tag name. */
  text: string;
  headings: string[];
}
