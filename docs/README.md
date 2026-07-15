# Canvas docs — native (Expo Router)

The universal Canvas documentation app. One Expo Router codebase renders the docs on
iOS, Android, and the web. It consumes the source-only `@nannier/canvas` library as a
**live symlink**, created by `postinstall` (`scripts/link-sources.mjs`) — bun copies
`file:` deps, which would freeze a stale snapshot, so we symlink instead. The generated
docs core lives in-tree at `src/core`.

## Develop

```sh
bun install            # also links ../src and ../docs-core into node_modules
bun run web            # Metro web dev server
bun run ios            # native dev build (needs Xcode)
bun run android        # native dev build (needs Android SDK)
npx expo export --platform web   # static web build → dist/
```

iOS builds need a UTF-8 locale or CocoaPods crashes during `pod install`:

```sh
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

## Native builds (EAS)

Native builds are produced by EAS through the manual **Deploy** workflow
(`.github/workflows/deploy.yml`): check the `ios` / `android` inputs and pick a build
profile. `production` auto-submits to TestFlight / Google Play internal; `preview` and
`development` produce internal-distribution builds (an installable Android APK + an
ad-hoc iOS build) shared by URL with no store review. The workflow queues the build on
EAS and exits (`--no-wait`); progress and store submission live on expo.dev (links
appear in the run summary). The job stays "skipped" until EAS is configured. One-time
setup (needs your Expo / Apple accounts; these cannot be automated):

1. `npm i -g eas-cli && eas login`
2. `cd docs && eas init` links the repo to an Expo project (writes the project id into the config)
3. iOS ad-hoc: `eas device:create` to register tester device UDIDs; EAS manages signing
4. Add an `EXPO_TOKEN` repository secret (an Expo access token) so CI can authenticate
5. Set the `EAS_ENABLED` repository variable to `true` to un-skip the deploy job

## Notes

- The icons in `assets/images/` are Expo template placeholders — replace with Canvas
  branding before a real release.
- `experiments.baseUrl` is set from `EXPO_BASE_URL` (see `app.config.js`) so the static
  web export can be hosted under a subpath (e.g. `/canvas/`); local dev stays at root.
- This is the single documentation site for every platform: the web target deploys to
  GitHub Pages (`.github/workflows/deploy.yml`) and the native targets ship via EAS. It
  replaced the previous Vite-based web docs.
