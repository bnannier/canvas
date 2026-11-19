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

Install [Bun](https://bun.sh) using the version in the root `package.json`.
Bun manages dependencies and runs the development scripts and tests. Use Node.js
for the tooling invoked by those scripts and Python 3 for the plugin unit tests
in the pre-push hook.

```bash
bun install            # root: kit dependencies
cd docs && bun install # docs app; its postinstall symlinks the kit source into place
```

The root install also installs the development-only Husky hooks through the
guarded `prepare` script. Git uses the relative `.husky/_` path, so hooks keep
working when the checkout moves or is used as a linked worktree. Run `bun run
prepare` from the root to repair an older checkout's hook configuration. CI,
production installs, and installs without Husky or a Git checkout skip this step;
the published package does not contain the hook installer.

To run the docs app (the kit's live showcase and your development harness):

```bash
cd docs && bun run dev # Metro on http://localhost:8081, native preview opener on :8790
```

Metro watches the repository root and resolves Canvas to live kit source through
the symlink. If Metro needs its cache cleared, restart with `bun run dev --clear`.

## Checks

The pre-push hook runs the following local checks in order and stops on the first
failure. Building before verification and tests ensures they use fresh compiled
output:

```bash
bun run typecheck         # kit TypeScript
bun run typecheck:e2e     # end-to-end suite TypeScript
bun run lint              # ESLint, including docs and tests
bun run build             # refresh the published package's compiled output
bun run verify-package    # compiled entry points, imports, and public types
bun run check-size        # CSS and JavaScript size budgets
bun run test              # unit tests and compiled-package smoke tests
bun run check:api         # every export classified, every docs claim true
bun run docs:gen:check     # generated docs match their source
bun run agent-docs:gen:check # versioned agent reference matches its source
bun run consumer:gen:check # packaged consumer guidance and recipes match source
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/plugins -p 'test_*.py' -v
bun run check:docs-components # handwritten docs use Canvas components
bun run privacy:gen:check  # generated privacy policy matches its source
bun run raster:gen:check   # generated native menu glyphs match their source
bun run designmd:gen:check # generated design reference matches its source
bun run notices:gen:check  # third-party notices match installed dependencies
bunx tsc --noEmit -p docs/src/core/tsconfig.json # generated example TypeScript
bun run --cwd docs typecheck # complete docs app TypeScript
```

If the local tuning-harness gate is installed, the hook first checks the pushed
commits for the tuning evidence described in [AGENTS.md](./AGENTS.md#motion-v4-reference-timing-and-verification).
The shared validation workflow also checks the docs web export, browser behavior,
theme tokens, design parity, and material and interaction coverage. The local
hook does not run the browser suite or deploy anything.

Use `bun run test` to run every unit test under `test/` and `tools/`, with the
shared React Native Web preload from `bunfig.toml`. For a focused run, use a path
starting with `./`, for example `bun test ./test/behavior.test.tsx`. Rooted paths
keep Bun's discovery within the test trees instead of scanning the entire
checkout and retaining enough directory handles to break subprocess tests on
macOS.

### Adding, removing or documenting an export

The style foundation's public names are listed one by one in `src/style/public.ts`;
`src/style/index.ts` is the kit's internal hub and never reaches the package, so a
helper added there stays internal. Every export of `@nannier/canvas` and every file npm
packs under `@nannier/canvas/styles/*` has an entry in `tools/api/manifest.ts`: its kind
(component, part, hook, token, utility, type, deprecated alias, or internal by accident)
and the docs route that names it, or, until a page does, a `PENDING_DOCS` entry with the
route planned for it. A public value carries a JSDoc summary on its declaration. `bun
run check:api` fails when an export or a file appears or disappears without its entry,
when a kind disagrees with the source, when a public value has no summary, when a named
route does not exist or never names the export, when a staged name's planned page
already names it, and when the materials manifest records a different docs route. A
deprecated alias needs a summary and `@deprecated` text naming its replacement.
Keep deprecated aliases and kit internals out of the API documented on pages or
in packaged guidance. A planned route closes at the audit turn that owns it
(`PLANNED_ROUTES` in the manifest), so nothing stays staged for a closed route. An
intended change to the surface also refreshes its snapshot with `bun run check:api
--write-snapshot`. Read the source and the page before writing an entry;
`tools/api/README.md` has the rules.

## Changesets and releases

Add a changeset for every commit, including documentation and tooling changes:

```bash
bun run changeset
```

Use `patch` by default. A `minor` needs a written justification naming the new
user-visible capability, such as a component, public API, option, or platform.
Major releases require the owner's explicit authorization: tick the `major` input
and enter the exact next major in `major_version` on the release dispatch. Write
the summary for a consumer reading the changelog.

### Run CI locally before pushing

Run the CI validation on your machine before every push. GitHub repeats these
checks on a manual release dispatch.

```bash
brew install colima docker act
colima start --vm-type vz --cpu 8 --memory 12 --disk 100
bun run ci:local
```

`ci:local` (`scripts/ci-local.mjs`) runs `.github/workflows/validate.yml` through
[act](https://github.com/nektos/act) in Linux runner containers. It runs the check
job, all four e2e shards, the web smoke job and the starter, with artifacts passed
between jobs as on GitHub (`bun run ci:local -- --job check` runs one job).
Commit first because act copies the working tree, which must match the commit you
will push. The script's header explains how it adapts `validate.yml` for act.
The native smoke jobs (an iOS simulator on a macOS runner, an Android
emulator) cannot run in a container. When a change touches native code, run them on
the Mac with `scripts/native-smoke.mjs` (see `tools/native/README.md`), and say so in
the commit when you have not.

Work directly on `main` unless the owner explicitly requests a branch or pull
request. Verify each phase, then commit and push it without force-pushing main.
Publication goes through CI; do not run `npm publish` locally. The `release`
script is CI-only and requires the prepared candidate and validated artifact
directories.

Start a release by manually dispatching the Deploy workflow on `main`. Select
the `npm` input, which defaults to off, to publish a patch or minor from pending
changesets. For an authorized major, use `major` and `major_version` as described
above. The `pages`, `ios`, and `android` inputs select web deployment and native
builds independently. With npm publication disabled, Deploy validates the
selected revision at its existing version.

CI freezes the candidate before validation, packs the npm package, and tests the
prepared web artifact. For an npm release, acceptance fast-forwards `main` to the
validated version commit and publication uses the sealed tarball. If `main`
advances before acceptance, dispatch again from its current revision. The selected
docs deployment and native jobs use the accepted candidate. Manual soak tests
and npm deprecation remain explicit troubleshooting and maintenance tools.

Canvas is one npm package, `@nannier/canvas`, and its Android capture module ships
inside it (`android/`, autolinked through the root `expo-module.config.json`). Every
changeset names `@nannier/canvas`; a changeset for any other package fails the
release preparation before a version is consumed. CI seals the one tarball, verifies
its hash and installed bytes, publishes it, and pushes its `v<version>` tag only after
publication succeeds. The optional-peer omission matrix installs Canvas alone; the
native smoke app installs the sealed tarball, checks that Expo autolinks its Android
module, and runs the module's instrumentation tests against it.

If a release fails after any publication step, fix the cause and add a new
changeset for the next version. Do not republish an old version or release a
locally rebuilt artifact.

## Design principles

Canvas is opinionated, and contributions are reviewed against these rules. The
full versions live in [AGENTS.md](./AGENTS.md).

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
