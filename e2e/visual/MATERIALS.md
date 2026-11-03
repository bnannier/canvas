# Material evidence

The maintained `tools/materials/manifest.ts` supplies every component reference
route to Lookout and `materials.e2e.ts`. Captures include inherited and unpainted
components so a theme change cannot silently add an unwanted surface. They do
not introduce new component frames or claim that every variant appears in the
default example.

`components.e2e.ts`, `overlays.e2e.ts`, and `tokens.e2e.ts` retain all 236
capture flows and check their approved frame dimensions by default. Existing
functional, style, and accessibility assertions remain in place. Screenshot
buffers exist only in memory; reports retain text metadata, never image evidence.

**This reduces automated visual coverage. Dimension checks cannot detect color,
shadow, typography, or other pixel changes that preserve the frame's size.** The
former tolerant image comparison cannot be reproduced from one-way hashes.
Unchanged Linux renders also have small JPEG and text raster variations, so exact
SHA256 equality proved unsuitable as the default CI gate. Full visual hand-off
review still requires matching live views or ephemeral local captures, which must
not be committed or uploaded by CI.

`pixel-digests.json` preserves dimensions and non-reversible SHA256 metadata for
all 236 previously approved Linux PNGs, derived directly before removal. The
images cannot be reconstructed from these entries. For an explicit strict pixel
diagnostic, run:

```sh
bun run e2e:pixels
```

That mode decodes in-memory PNGs to sRGB RGBA8 and requires consecutive identical
frames matching the approved digest, polling within a 10-second deadline.
Compression and PNG metadata do not affect the hash. Any changed pixel or
geometry fails; there are no automatic approvals or raster-variant whitelists.
Known unchanged-render raster differences can fail this diagnostic, so a failure
requires investigation and is not by itself proof of a design regression.

Default element-frame checks retry a dimension mismatch at an integer origin only
when the live box's rounded-up extent matches its approval and Playwright's outward
rounding explains the entire mismatch. Each retry frame remeasures the box, so real
growth still fails. Matching historical captures, strict pixel diagnostics, and
reviewed metadata updates retain the original element-capture path.

Comparisons remain Linux-only. Other operating systems execute the flows without
comparing the Linux dimensions or hashes. Use Linux with the pinned Playwright
version and matching fonts to compare or update. CI currently uses ubuntu-latest,
not a pinned operating-system image. `E2E_FORCE_VISUAL` is only for an equivalent
Linux environment. Playwright screenshot, trace, and video retention are off.

To review an intentional change, open the affected live view in the matching
Linux browser at the test's viewport (normally 1280 by 900, scale 1), scheme,
solid surface, state, and reduced-motion setting. Inspect it against the vendored
hand-off and intended change. Since historical images are not retained, review an
earlier revision live when needed. Then run a bounded metadata update locally:

```sh
bun run e2e:update --grep 'button in (dark|light)'
git diff -- e2e/visual/pixel-digests.json
```

`e2e:update` explicitly sets `E2E_UPDATE_DIGESTS=reviewed`, runs one worker, and
writes only the metadata JSON. It means manual review has already happened; it
does not perform that review. Never run a blanket refresh to hide unexpected
failures. Ordinary runs, missing approvals, unstable captures, and
`--update-snapshots` cannot accept new metadata. Updates are forbidden on CI.

The material matrix captures light and dark glass at desktop and phone widths
only in memory and retains computed browser material diagnostics as text. Glass
pixels are not portable GPU baselines. The subsequent solid pass asserts zero
active backdrop effects and zero clear materials in the component row and opened
overlay host. A passing count does not establish composited text contrast;
review the live view and run Lookout locally when image evidence is needed.

Lookout keeps its fixed-viewport rest captures and adds `full-content` evidence
for every glass route. This state fits viewport height to the complete preview
while preserving its requested width, then restores the viewport. The extra
evidence avoids an element crop photographing blank space or fixed navigation
over a tall nested scrollport. Use rest shots to judge the actual viewport and
full-content shots to inspect all three browser skin rows.

`material-states.e2e.ts` uses the real docs appearance controls to exercise both
directions of a live material change. It checks the user's draft, input host
identity, selected segment and removal of solid-mode backdrop work. Clicking the
appearance control intentionally changes focus, so these tests do not claim
focus preservation inside an overlay. That contract requires a controlled
ThemeProvider fixture or native integration test that changes mode without
outside-dismiss input.

```sh
bun run typecheck:e2e
E2E_BASE_URL=http://localhost:8081 bunx playwright test --project=visual e2e/visual/material-coverage.e2e.ts e2e/visual/materials.e2e.ts e2e/visual/material-states.e2e.ts
```

Use `--grep` to select a bounded evidence run while implementing a family. The
full matrix is a coverage sweep. Rest captures request Reduce Motion; the
Lookout `button-group-held` recipe explicitly enables ordinary motion and
restores the preference afterward. A held screenshot is evidence of lift only,
not travel, recoil, settle or interruption.

## Actual native capture

Lookout supports one native target per run and currently captures resting deep
links only. Its native driver does not apply target-level query parameters or
execute browser state recipes. The dedicated targets therefore put
`surface=glass` or `surface=solid` in every route path. Native routes are marked
iOS/Android-only so web captures cannot be mistaken for native evidence.

```sh
lookout capture --targets glass --platforms web
lookout capture --targets native-glass --platforms ios,android
CANVAS_LOOKOUT_NATIVE_SURFACE=solid lookout capture --targets native-solid --platforms ios,android
```

Use the configured Lookout CLI on the machine if `lookout` is not on PATH. Set
`ADB` to the Android SDK's executable when needed. Both native runs require
booted devices with `com.nannier.canvas` installed and the docs service running.
The configuration does not boot devices, install apps or start services.

A native resting capture does not establish open-overlay behavior, material
capability, fluid motion, Dynamic Type, TalkBack/VoiceOver or platform preference
fallbacks. Verify those on the actual runtime and report unavailable coverage
explicitly. The iOS and Android rows inside a browser screenshot remain browser
skin previews.
