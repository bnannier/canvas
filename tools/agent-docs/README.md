# Generated agent reference

Run `bun tools/agent-docs/generate.ts` to refresh the current package version's
source snapshot. Run `bun tools/agent-docs/generate.ts --check` to detect missing,
stale, or orphaned current-version files without changing anything. The generator
does not query npm and does not publish documentation.

The output is `docs/public/ai/<package.json version>/`, plus the current source
entry guide `docs/public/agents.md` and indexes `docs/public/llms.txt` and
`docs/public/llms-full.txt`. The entry guide is generated from the maintained
`tools/agent-docs/agents.md` template; `{{VERSION}}` follows the root manifest while
the dated statement about the published 4.0.0 package remains historical. Human docs, examples,
visuals and animations are untouched. Copy these static files to the same public
site root when preparing Pages. Preserve old `ai/<version>/` directories when
building or deploying a later version; a clean build must include those tracked
directories too.

## Sources and schema

`catalog.json` uses schema version 1. `package`, `version`, `status` and `sourceHash`
identify the source snapshot. `dependencies` is the root manifest's peer dependency
list, retaining ranges and optional flags. `exports` comes from the actual public
TypeScript entry, classified by the existing API manifest. `theme` and `sharedProps`
contain resolved prop groups. `components` includes each registered component's:

- `slug`, `name`, `category`, source-derived `description`, `source`, `url` and `humanUrl`.
- `exports`: actual public names belonging to this directory or its API-manifest docs route.
- `dependencies`: package-wide required peers plus optional peers directly imported or
  guarded-required in that component's source directory. Shared material dependencies
  remain in the package-wide list; this is not a transitive installation requirement.
  Installation guidance records feature fallbacks.
- `propGroups`: the existing docgen's typed groups, descriptions, defaults and boolean
  axes, with complete resolved type strings and inherited fields expanded. `inherits`
  retains the authored inheritance expression. Glyph booleans are included in Icon's
  machine props; the deliberately internal Icon paint channel stays excluded.
- `platformNotes`: source intro text for each platform view. These are documentation
  excerpts, not inferred native capability claims or audit sign-offs.

Markdown pages reuse the authoritative co-located component Markdown. Intentional
Do/Don't pairs stay labeled. Existing imports are normalized to `@nannier/canvas`
and checked against the public barrel. Snippets are excerpts: application data,
handlers and React hooks must be supplied, and `tokens` comes from `useTheme()`.
Raw React Native primitives expose their host signature props. Types describe the
public source API; use installed declarations when the dependency differs.

Installation, runtime support and overlay guidance reuse the corresponding `USAGE.md`
sections; theming props come from `ThemeProviderProps`, and layout links the existing
Container, Row/Column and Grid pages. The generator does not use the usage guide's legacy
theme prose as a source of palette or font values.
Usage-guide navigation is mapped to public versioned guides and onboarding/terms anchors;
unmapped repository links fail generation instead of sending readers to private source.

`manifest.json` stores SHA-256 digests for source inputs and every versioned output
except itself. `globalFiles` records hashes of the generated entry guide and discovery
indexes as they stood at generation time; those global pages follow newer source
versions, so retained archives validate only their versioned `files`. `sourceHash`
hashes the sorted source digest map, including the entry-guide template. There are no
timestamps, Git SHAs, network requests or environment-dependent absolute paths.

## Version and archive policy

Package version labels a **source snapshot**, not a verified npm release. Release
tooling should generate again after any version change and before packing or
deploying. Never rewrite a release's package version just to label newer docs.

Only the current package version is regenerated or pruned. Older versions are read
and their manifest content hashes are verified, then left untouched. Moving from
4.0.0 to 4.0.1 creates a new directory while preserving 4.0.0. Global `llms` files
point at the current source version. Keep prior directories in Git to retain them
on a clean static export; preservation is not achieved by relying on server state.

An optional `sealed: true` field in a snapshot manifest prevents regeneration of
that version. This explicit safeguard can be used by release tooling; this tool
does not infer npm publication from a version string or a Git tag. An intentional
archive repair requires review of the snapshot and manifest together.

## Validation

`bun test tools/agent-docs` exercises import safety, Markdown section boundaries,
deterministic generation, version isolation, drift and manifest integrity. Generated
assets are text only. No screenshots or browser automation are used.
