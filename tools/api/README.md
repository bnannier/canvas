# Public API manifest

Run `bun run check:api` from the repository root, or add `--json` for the counts and
errors as data. The gate reads the package's public surface from source and needs no
build: package.json `exports`, the named exports of `.` through the TypeScript checker,
and the docs app's pages. It runs in the pre-push hook and in CI beside
`check:materials`.

`manifest.ts` is authored by hand. It has three parts:

- `entryPoints`: every subpath of package.json `exports` and how the gate enumerates
  it. `.` is a `module` (src/index.ts), `./styles/*` is `files`, `./package.json` is
  `metadata`. A new subpath fails until it is classified, and only `.` can be read as
  a module.
- `publicApi`: every named export of `.`, values and types, with its `kind` and
  `docs`.
- `files`: every file `./styles/*` reaches.

## What the gate checks

- **Every export is classified, and no entry outlives its export.** An export added
  or removed without its entry fails, and so does a new file under `styles/`.
- **The native entry exports what the web entry does.** dist/native resolves each
  platform's sibling files under Metro (`.ios`, then `.native`, then the plain file).
  The checker reads the entry under that lookup for iOS and for Android, and a fork
  that drops, adds or changes a name fails.
- **A kind agrees with the source.** `type` is a type-only export (a type-only helper
  may also be `internal-by-accident` or `deprecated-alias`). `component` and `part`
  render as React components; a value that renders is one of those, an internal or a
  deprecated alias. `hook` is a `use*` function, and a `use*` function is a hook unless
  it is internal or deprecated. A `token` is data, never a function.
  `deprecated-alias` is exactly the exports that carry `@deprecated` (on the
  declaration or on any re-export on the way), and its `replacement`, when given, is
  a live public export.
- **A docs claim is true.** `docs` is `undocumented` or a route the docs app serves
  (a static screen, a component page or one of its example deep links, a pattern, a
  template; never the hidden `testing/` harness). The page's rendered text has to name
  the export as a whole identifier, and a `section` has to be one of the page's
  headings. A file is named by its import specifier (`@nannier/canvas/styles/…`).

"Rendered text" is what a reader can see: string literals, code snippets, template
text and JSX text, plus a component page's catalog entry and its generated examples,
Do & Don't pairs and prop tables. An import or a JSX tag that only uses a component
does not count, and neither does a comment.

## Writing an entry

Read the export's source and its candidate page first. The kinds are defined in
`types.ts`. In short: a `component` has a job of its own; a `part` sits inside
another public unit (a compound child such as CardHeader, an item such as GridItem, a
family companion such as ToastProvider, a token file canvas.css imports); `utility`
is any other value a consumer calls or reads; `internal-by-accident` is a helper the
source writes for the kit's own skins and components, public only because a barrel
re-exports its module. Recording that is a fact about the source, not a deprecation:
deprecating or removing a name is the owner's decision.

`docs` is the export's home page when that page names it: its own component page, or
the guide page or section that presents it. A name met only in passing (another
component's prop table, an ordinary word that happens to match) is `undocumented`.
The gate checks that a claimed page names the export; it cannot tell a passing word
from a reference, so a short name that is also an English word (`palette`, `shape`)
needs that judgment from whoever writes the entry.
