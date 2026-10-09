# Public API manifest

Run `bun run check:api` from the repository root, or add `--json` for the counts and
errors as data. The gate reads the package's public surface from source and needs no
build: package.json `exports`, the named exports of `.` through the TypeScript checker,
the files npm packs under `./styles/*`, the docs app's pages, and the material
inventory's docs routes. It runs in the pre-push hook and in CI beside
`check:materials`.

The surface itself is explicit. src/index.ts re-exports the components' entries and
src/style/public.ts, which lists the style foundation's public names one by one;
src/style/index.ts is the kit's internal hub and never reaches the package. A helper the
kit adds for its own skins stays internal until someone lists it in public.ts.

`manifest.ts` is authored by hand. It has four parts:

- `entryPoints`: every subpath of package.json `exports` and how the gate enumerates
  it. `.` is a `module` (src/index.ts), `./styles/*` is `files`, `./package.json` is
  `metadata`. A new subpath fails until it is classified, and only `.` can be read as
  a module.
- `publicApi`: every named export of `.`, values and types, with its `kind` and, once
  a page documents it, its `docs` route.
- `files`: every file `./styles/*` publishes, the same way.
- `PENDING_DOCS`: the staged docs migration (audit K12). Every export or file with no
  `docs` route is listed here with the route planned for it, and nothing else is.

`test/fixtures/public-api.json` is the machine-written record of the same surface (each
export of `.`, a value or type-only). `bun run check:api --write-snapshot` rewrites it;
test/public-api.test.ts holds every resolution of the entry, the manifest's names and
the compiled dist/index.js to it. A deliberate API change refreshes it in the same
commit as its manifest entry.

## What the gate checks

- **Every export is classified, and no entry outlives its export.** An export added
  or removed without its entry fails, and so does a new file under `styles/` that npm
  would pack (Finder's `.DS_Store`, editor swap files and the rest of npm's never-packed
  names are not surface; an ignore file below the root stops the read).
- **The native entry exports what the web entry does, with the same facts.** dist/native
  resolves each platform's sibling files under Metro (`.ios`, then `.native`, then the
  plain file). The checker reads the entry under that lookup for iOS and for Android,
  and a fork that drops or adds a name, turns a value type-only, a component into a
  non-component, a function into data, or deprecates a name on one OS fails.
- **A kind agrees with the source.** `type` is a type-only export (a type-only helper
  may also be `internal-by-accident` or `deprecated-alias`). `component` and `part`
  render as React components; a value that renders is one of those, an internal or a
  deprecated alias. `hook` is a `use*` function, and a `use*` function is a hook unless
  it is internal or deprecated. A `token` is data, never a function.
  `deprecated-alias` is exactly the exports that carry `@deprecated` (on the
  declaration or on any re-export on the way), and its `replacement`, when given, is
  a live public export.
- **A public value has a JSDoc summary.** Every `component`, `part`, `hook`, `token` and
  `utility` value carries a summary on the declaration a consumer's editor shows through
  the published types (the web build's). A summary written on a re-export, or on the
  binding of a destructured export, never reaches that hover, so it does not count. A
  declaration a dependency owns (React Native's View) is its owner's to document.
- **A docs claim is true.** `docs` is a route the docs app serves (a static screen, a
  component page or one of its example deep links, a pattern, a template; never the
  hidden `testing/` harness). The page's rendered text has to name the export as a whole
  identifier, and a `section` has to be one of the page's headings. A file is named by
  its import specifier (`@nannier/canvas/styles/…`).
- **PENDING_DOCS is staged, not waived.** A name with no `docs` must be listed, and a
  listed name must have no `docs`. Its planned route must exist (or be `foundation`, the
  generated reference K12-10 adds), and the day that page names it the gate asks for the
  move to `docs`. Once the `foundation` route exists the list must be empty.
- **The two manifests agree.** The material inventory (tools/materials/manifest.ts)
  records a docs route for every renderable. It must be the API manifest's `docs`, or,
  while the docs are pending, none or the planned route.

"Rendered text" is what a reader can see: string literals, code snippets, template
text and JSX text, plus a component page's catalog entry and its generated examples,
Do & Don't pairs and prop tables. An import or a JSX tag that only uses a component
does not count, and neither does a comment. A name that is also an ordinary word (one
lowercase word, one capitalized word, one all-capitals word: `palette`, `Surface`,
`FILL`) counts only where the page shows it as code: a snippet (comments stripped),
inline code, a generated prop table's names and types, or a backtick span. Prose uses
those words for their meaning.

## Writing an entry

Read the export's source and its candidate page first. The kinds are defined in
`types.ts`. In short: a `component` has a job of its own; a `part` sits inside
another public unit (a compound child such as CardHeader, an item such as GridItem, a
family companion such as ToastProvider, a token file canvas.css imports); `utility`
is any other value a consumer calls or reads; `internal-by-accident` is a helper the
source writes for the kit's own skins and components, public only because the style
hub's `export *` published it before public.ts listed the surface. Recording that is a
fact about the source, not a deprecation: the owner retires those names as deprecated
aliases.

`docs` is the export's home page when that page names it: its own component page, or
the guide page or section that presents it. A name met only in passing (another
component's prop table, a list of names, an ordinary word) is not documented there: stage
it in PENDING_DOCS with the page that will document it. The gate checks that a claimed
page names the export and catches ordinary words; it cannot tell a passing mention of a
compound identifier from a reference, so that judgment stays with whoever writes the
entry.
