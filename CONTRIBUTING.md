# Contributing to Canvas

Thanks for your interest in Canvas. This guide covers setting up a development
environment, the checks your change must pass, and the design principles every
contribution is reviewed against.

## Repo layout

The kit source lives in `src/` (`atoms/`, `molecules/`, `organisms/`, `charts/`,
`style/`, plus the theme and token modules). Build tooling lives in `tools/`
(docgen, icongen, favicongen, rastergen) and one-off scripts in `scripts/`. The CSS
foundation is in `styles/`, the test suite in `test/`, and the documentation app,
a universal Expo Router app that runs on iOS, Android, and web and doubles as the
published docs site, in `docs/` with its own `package.json`. Compiled output goes
to `dist/` (gitignored).

## Setup

Canvas uses [Bun](https://bun.sh) for everything: install, scripts, and tests.

```bash
bun install            # root: kit dependencies
cd docs && bun install # docs app; its postinstall symlinks the kit source into place
```

To run the docs app (the kit's live showcase and your development harness):

```bash
cd docs && bun run dev # Metro on http://localhost:8081, native preview opener on :8790
```

Component edits hot-reload into the docs. Note that Metro does not hot-watch the
symlinked kit source in every case; if a kit edit does not show up, restart with
`bun run dev --clear`.

## Checks

Run these before pushing; the pre-push hook runs the same battery and will block a
push that fails any of them:

```bash
bun test               # unit tests (bun test + react-native-web + happy-dom)
bun run typecheck      # kit TypeScript
bun run lint           # ESLint
bun run docs:gen:check # generated docs are in sync with the source
bun run raster:gen:check # generated native menu glyphs are in sync
```

## Changesets

Any change that ships in the published package (component code, styles, tokens,
public types) needs a changeset:

```bash
bun run changeset
```

Pick `patch` for fixes, `minor` for new capabilities, and write the summary for a
consumer reading the changelog. Docs-only and tooling-only changes do not need one.

## Design principles

Canvas is opinionated, and pull requests are reviewed against these rules. The full
versions live in [CLAUDE.md](./CLAUDE.md).

- **React Native everywhere.** Components are built from React Native primitives
  (`react-native`, `react-native-svg`, the kit's own primitives) so one codebase
  renders on iOS, Android, and web. No web-only escape hatches: no reaching into the
  DOM, no raw CSS on nodes, no `Platform.OS === "web"` markup forks. If React Native
  lacks a primitive, build the effect cross-platform (SVG, style props, math).
- **Semantic boolean props.** Styling is expressed as flat boolean props named for
  meaning (`<Button primary large>`), never string enums (`variant="primary"`).
  Props group into axes (intent, size, density, state); one prop per axis.
- **No styling escape hatches.** A component's look comes from its semantic props
  and the kit's layout primitives, never from `style={{...}}` overrides at the call
  site. If a capability is missing, add it to the kit as a prop or component.
- **Dogfooding.** Every UI element in this repo, docs included, is a Canvas
  component or kit primitive. If the kit lacks something, create or extend the kit
  component rather than hand-rolling a look-alike.
- **Responsive, desktop-first.** Every component adapts from large desktop down to
  phone; author the desktop case first, then scale down.

## Reporting issues

Use the issue templates for bugs and feature requests. For security reports, see
[SECURITY.md](./SECURITY.md); please do not open public issues for vulnerabilities.
