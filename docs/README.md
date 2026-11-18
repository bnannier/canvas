# Canvas docs (Expo Router)

The universal Canvas documentation app runs on iOS, Android, and the web from one
Expo Router codebase. The published `@nannier/canvas` package contains compiled
`dist/` output. This app develops against the checkout's live `src/` instead:
`postinstall` creates a `node_modules/@nannier/canvas` symlink to the repository
root, and `metro.config.js` resolves the package import to `src/index.ts` through
that symlink. Metro also watches the source and resolves the native skin files.
Expo autolinks Canvas's Android capture module from the repository root
(`nativeModulesDir: ".."` in `package.json`, read through the root's
`expo-module.config.json`); rebuild the native app after changing `../android`.
Generated documentation and examples live in-tree at `src/core`.

## Develop

Start from the repository root:

```sh
bun install
cd docs
bun install            # links the live kit checkout into this app
bun run dev            # Metro on :8081 and native preview opener on :8790
```

The web docs are at <http://localhost:8081/>. The preview opener routes HTTP links
to a booted iOS simulator or Android emulator with the docs development app
installed. Use `bun run dev --clear` if Metro needs its cache cleared.

From `docs/`, run the app on the target platform:

```sh
bun run web            # Metro web development without the preview opener
bun run ios            # build and run natively with Xcode
bun run android        # build and run natively with the Android SDK
```

Install the independent recipes app's locked dependencies before building the
web artifact. From `docs/`:

```sh
bun install --cwd ../examples/recipes --frozen-lockfile
bun run build:web
```

`build:web` runs the Expo export into `dist/`, inlines CSS, prepares the output
for Cloudflare Pages, and schedules bundle execution after the first paint. It
then exports the recipes app into `/recipes/` and refreshes the sitemap.

iOS builds need a UTF-8 locale for CocoaPods:

```sh
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bun run ios
```

## Validation and web deployment

The **Deploy** workflow in `.github/workflows/deploy.yml` runs only when a release
is manually requested on main. Commits and pull requests do not trigger GitHub
CI/CD. Select `pages` for a web deployment and `npm` to publish a patch or minor
from pending changesets. Deploy freezes the selected source before the shared
validation workflow runs. The candidate carries a version bump when an npm release
is requested and has a valid changeset plan. Validation builds the package and
web docs, checks their types and generated sources, and runs the unit and browser
suites.

Publication accepts the frozen candidate only while its source is still the
current main revision. If main advances, the candidate is discarded; manually
dispatch another release from the current main revision. With `pages` selected and
`CLOUDFLARE_ENABLED=true`, Cloudflare Pages receives the same prepared web artifact
that the browser tests exercised. The production site is
[canvas.nannier.com](https://canvas.nannier.com/).

An npm release publishes the validated Canvas tarball, including its native
module, through CI. The [contribution guide](../CONTRIBUTING.md) covers changesets
and recovery.

`EXPO_BASE_URL` remains available for deployments under a subpath through
`app.config.js`. Production and local development use the root path.

The homepage and footer version labels, including the component detail footer,
fetch the latest published `@nannier/canvas` version from npm on screen focus.
When the registry is unavailable, the labels retain the last successful lookup.
They use the build's package version before the first successful lookup. The app
binary's version comes from the validated release candidate.

## Native builds (EAS)

For native builds, run **Deploy** manually on main, select the `ios` and/or
`android` input, and choose an EAS profile. These jobs use the accepted, validated
source. The EAS pre-install hook installs the frozen root workspace before the
docs postinstall links the kit source. The native build compiles the autolinked
Android module. The workflow queues builds with `--no-wait`; successful queueing is not a
completed device build or store submission. Follow the EAS links in the run
summary for those results.

- `production` creates store builds and automatically submits iOS to App Store
  Connect. Android submission to the Play internal draft track additionally
  requires `PLAY_SUBMIT_ENABLED=true` and its configured service-account key.
- `preview` and `development` create internal-distribution builds. The preview
  profile produces an Android APK and a device iOS build; development includes
  the development client. Neither profile submits to stores.

Native jobs require the repository's `EXPO_TOKEN` secret and `EAS_ENABLED=true`
variable, plus the signing and store credentials configured in EAS. Project and
profile configuration live in `app.json` and `eas.json`; current store setup and
submission notes live in [store/SUBMISSION.md](../store/SUBMISSION.md).

The app version follows the root Canvas `package.json` through `app.config.js`;
there is no separate version to maintain in `app.json`. Deploy restores the
validated candidate and checks Expo's resolved version against it before either
native build is queued. EAS's production profile uses remote `autoIncrement` to
advance build numbers separately. After Apple has approved a Canvas version,
release a newer Canvas version before submitting another store release.
Rebuilding the approved version can still cause
ITMS-90186 / ITMS-90062. The `appVersion` runtime policy follows the same Canvas
version, so a version change requires a new native binary.

The app uses the generated Canvas C mark, not Expo template branding. Regenerate
icons through `bun run appicon:gen` from the repository root.
