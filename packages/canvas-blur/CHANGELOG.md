# @nannier/canvas-blur

## 0.1.2

### Patch Changes

- 98596c4: Retry the npm publish that `patient-scopes-return`'s release attempt started but couldn't finish: that changeset's version bump (3.4.3 / 0.1.1) landed in git and on GitHub, but the registry publish itself failed on an invalid NPM_TOKEN (`ENEEDAUTH`), so neither package actually reached npm and the git tags were never pushed. Per this repo's own recovery path (a partial release gets a new changeset, not a retry of the same version), this one carries the versions forward so the next CI run makes a fresh publish attempt with the corrected token.

## 0.1.1

### Patch Changes

- 47fe3e3: Move the repository and npm scope back to the personal account. GitHub `ionizeio/canvas` transfers to `bnannier/canvas`, and the packages publish as `@nannier/canvas` and `@nannier/canvas-blur`, continuing the version lineage `@ionizeio/canvas` and `@ionizeio/canvas-blur` were on. `@ionizeio/canvas`, `@ionizeio/canvas-blur`, and `@nannier-com/canvas` stay installable but should be deprecated pointing at the new name once this publishes.

## 0.1.0

### Minor Changes

- 8f85af0: Add the optional Android capture renderer @nannier/canvas-blur and the Canvas integration for Android 12 or newer. This minor release adds a native material capability without requiring the new package for existing Canvas consumers. The module starts at 0.1.0 and uses Expo SDK 57 native APIs.

### Patch Changes

- 8f85af0: Keep captured backdrops aligned through ancestor scale, rotation, scrolling and separate-window positioning. Observe transform changes without continuous redraw and release both native window observers when the material disconnects.
- 8f85af0: Preserve the original Android host background, borders, corners and overflow while sampling its native paint. Keep visible content separate from sampled paint to avoid doubled translucent fills, and require the complete optional native integration before enabling capture.
- 8f85af0: Gate Android native smoke on the capture module's instrumentation tests using sealed installed production sources and test inputs from the same candidate revision. Preserve JUnit, native test configuration, source identity, and failure logs while keeping generated build output outside the installed package.
- 8f85af0: Refresh separate-window material when retained backdrop content changes without recreating its parent recording. Keep same-window geometry observation passive and remove all source callbacks when capture ends.
