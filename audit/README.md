# Component audit

Every Canvas component is held to the bar of a world-class design system: correct on iOS,
Android and the web, aligned across phone, tablet and desktop, and verified by photographs,
not by tests alone. This directory holds the per-component and per-page checklists that
drive that audit; the captures they are judged against live, uncommitted, under `.audit/`.

## The matrix

The inventory (`tools/audit/inventory.ts`) is the one source of capture ids. It is derived
from the docs' own nav config and each component's markdown, through `e2e/support/routes.ts`,
so it cannot drift from what the docs app serves.

| Axis | Values |
|---|---|
| Components | the 104 component pages, each with every Playground example as a variant (611 in all); the variant directory is the example label slugified (`variantSlug`), `default` for the Usage fence |
| Pages | the 6 patterns and 18 templates (`<kind>-<slug>`) |
| Looks | `blush` (the light default), `mint` (the light mint palette), `dark` |
| Surfaces | `solid`, `glass` |
| Widths (web) | `phone` 390 x 844, `tablet` 768 x 1024, `desktop` 1440 x 900 |
| Platforms | `web`, `ios`, `android` |

One variant is 18 web cells (3 widths x 3 looks x 2 surfaces) and 6 cells on each native
platform (3 looks x 2 surfaces). A cell's id is its path under a capture run:
`web/<slug>/<variant>/<width>.<look>.<surface>`, `ios/<slug>/<variant>/<look>.<surface>`,
`android/...`; pages use `web-pages/<kind>-<slug>/...` and `<platform>-pages/...`.

## The checklists

`audit/components/<slug>.md` (104) and `audit/pages/<kind>-<slug>.md` (24), one per docs
route. Each file is half generated and half hand-maintained:

- **Facts** (generated, between `<!-- audit:facts:begin -->` and `<!-- audit:facts:end -->`):
  what the repo's own records say about the component, gathered by `tools/audit/facts.ts`
  with no React Native import. Its route, source files, markdown and exports; where it is
  built (its own source directory, or, for the raw primitives whose directory holds only
  markdown, the kit module the kit's `src/index.ts` leads its name to, `src/style/text.tsx`
  for Text and TextInput and `src/style/pressable.tsx` for Pressable, or React Native's own
  View and ScrollView, re-exported from `src/style/primitives.ts`); which of its builds
  differ per platform (`tools/skins/divergence.ts`, read per export; data an entry writes
  itself counts as the platform's own unless the web entry has the same literal at the same
  place, so `createChip({ radius: 3 })` is never read as the web skin) and which are in
  the docs' platform-skin registry; its row in `PLATFORM-REFERENCES.md` (treatment, build,
  and whether each platform cell is a real reference link or a `none` note); its
  `tools/materials/manifest.ts` entries; its hand-off parity records split into open gaps,
  settled divergences and metric gaps (read from `tools/handoff-parity/divergences.json`,
  applied to the component through `tools/handoff-parity/compare.ts`, the same comparison
  `HANDOFF-PARITY.md` is generated from: a `global` record covers every hand-off prop the
  kit lacks under that name, which takes the hand-off snapshot and the kit's built prop
  surface, so the facts read `dist/` and `bun run build` comes first); its interaction
  evidence and overlay recipe; the test files importing it (the files `bun test` runs, one
  of its exports imported from the kit, or any module in its source directory, so a `View`
  imported from `react-native` or the word "Text" in a test does not count; a test is
  credited with what its own support modules under `test/` import, the fixtures it imports
  or names by a path, and the fixtures are not tests themselves); the e2e specs naming it
  (the docs suite's `*.e2e.ts`, the starter app's own suite and the audit's capture runner
  left out), by the same import rule, or by the exact route of its docs page or of a hidden
  `/testing/*` harness page whose module or fixtures render it, in a string literal of the
  spec or as the route one of its navigations (`gotoDocs`, `page.goto`) builds outside a
  catalog sweep (not a comment, and with the route followed by a character that cannot
  continue a slug, so `/components/button-group` does not credit Button); separately, the
  e2e catalog sweeps that drive it, the specs that loop over a whole catalog of docs routes
  (`componentRoutes()`, `contentRoutes()`, `allRoutes()`, `componentExamples()`,
  `MATERIAL_ROUTES`, the overlay recipes; `tools/audit/sweeps.ts`), in a `for...of`, a
  `for...in`, an indexed `for` or an array method's callback, and navigate to each row's
  route, credited with the rows their guards let through and the catalog each iterates (a
  loop over a catalog that only checks its data drives nothing); its `MeasureProps` adoption; and its touch-target vocabulary: every value
  `src/style/touch-target.ts`, `touch-target-seed.ts`, `touch-seam.ts` and `clip-slop.ts`
  export, the `TouchTargetSkin` field `minTarget`, and `hitSlop`, per module, with
  `test/touch-target-coverage.test.ts`'s record of how a pressable that declares no
  `minTarget` meets the floor (or the gap it is known to have). The source facts are read
  as identifiers in the code of its implementation's TypeScript modules (nested ones
  included, tests and the markdown left out). `bun tools/audit/facts.ts <slug>` prints the
  same as JSON. A page's facts name its data module, its sections, the kit names its own
  entry in that module uses (through the module's local functions and consts that entry
  reaches, so a pattern is never credited with a sibling pattern's components, and a type
  is not a name), and the specs and sweeps that drive it.

  A fact is exactly true, or the generator fails with the file and line of the code it
  cannot read; it never drops what it cannot read and never guesses. The test and e2e trees
  are read by a static reader (`tools/audit/static-eval.ts`) that never runs the code: it
  follows literals, consts, the rows of the loops around a node (a table-driven import such
  as the skins smoke test's ``import(`../src/${c.dir}/${c.file}${suffix}.tsx`)`` and
  `mod[c.name]` over its CASES table is read row by row), the parameters of a helper bound
  at every call site in the module (a route `entry(page, recipe)` builds from its caller's
  row, a component `entry(path, name)` loads), the guards on the way (`if (...) continue;`
  drops the rows it skips), the namespace reads through any cast, the files a test lists
  from the checkout (`tools/audit/hosts.ts`: node:path, read-only node:fs and Bun's Glob
  inside the checkout, `import.meta`, the repo's own exported consts), and never a `const`
  the module changes (push, splice, a length or index assignment). Every dynamic import and
  every navigation must resolve that way, and every route a spec reaches must be one it
  names or one a sweep is credited with; otherwise loading the facts fails
  (`UnreadableImport`, `UnreadableNavigation`, `UnreadableSweep`). A module a test copies
  into a `mkdtemp` directory has a name no reader can know, but it is provably some path
  inside the temporary directory, outside the checkout, so never the kit's. The docs
  suite's mount prefix (`BASE_PATH`) is no part of a route, so it is read as empty.
- **Variants** (generated, between `<!-- audit:variants:begin -->` and
  `<!-- audit:variants:end -->`): one row per variant with a tick cell per platform (Web 18,
  iOS 6, Android 6) and a notes cell. Rows are merged by variant key on regeneration, so
  ticks and notes survive an example being added, removed or relabelled. A page's rows are
  the whole page (`page`) and then one per section, keyed by the section title slugified
  the way an example label is (`Live comparison` is `livecomparison`), so a section keeps
  its ticks when another is inserted, removed or moved; retitling a section gives it a new
  key. A row's cells are split on unescaped pipes only, and everything after the three tick
  cells is the note, so a `|` typed in a note is kept (and escaped as `\|` on the next
  write). `--write` never discards a reviewer's work: a row it cannot read (a tick cell
  that is not `[ ]` or `[x]`, a key without back-ticks, a key twice), or a row carrying ticks or a
  note whose key the inventory no longer has, leaves that file untouched and names the
  line to fix by hand.
- **Universal rubric** (seeded once): the 11 items applied to every component, each with its
  evidence source (S source or test read, A accessibility tree or DOM probe, P photograph,
  N native device check). Severity follows rn-library-audit: critical, high, medium, low.
- **Family checklists** and **Specific checks** (seeded once): the component's families and
  its own row from the plan, with the native shape it is owed per `PLATFORM-REFERENCES.md`
  (HIG keeps the iOS control's shape, M3 the Material 3 shape, DF means the native skin is
  the Dark Factory look and should alias the web skin). The seed is data,
  `tools/audit/plan-specifics.ts`, so a new checklist always starts from the same text.
- **Findings** (hand-maintained): one row per finding with id, severity, cell (one of that
  checklist's capture ids in the inventory, back-ticked or not, or `source` for a finding
  read in the code), summary, status (`open`, `verified`, `fixed`, `wontfix` with the
  owner's reason, `duplicate`) and the fix commit, a commit SHA (7 to 40 hex digits), which
  may be left off until there is one and is required once the status is `fixed`.
- **Sign-off** (hand-maintained): one row per platform with the run id of the after-capture
  run that shows the component passing, the reviewer, the date and the result.

Every table is read with one reader (`tools/audit/table.ts`): cells split on unescaped
pipes only, an empty cell typed `| |` is an empty cell, and a `|` typed in a free-text
column (a variant's note, a finding's summary, a sign-off's result) stays in that cell.
A row it cannot read (too few cells, a severity or status that is not one of the table's
words, a cell that is neither one of the checklist's capture ids nor `source`, a `fixed`
finding with no fix commit, a fix commit that is not a SHA, an ID or platform twice, a row
below the blank line that ends the table) is
named by line by `audit:checklists:check` and listed under `audit:status`'s counts, never
dropped from them silently.

The seeded sections are written only when a file is first created; after that `--write`
replaces the two generated blocks and carries everything else over byte for byte. Running
it twice changes nothing. A file whose markers are gone is refused, not guessed at: restore
the markers or delete the file to reseed it.

The style-layer renderables with no component page have no checklist of their own:
AnchoredOverlay, BreakpointOverride, Entrance, FloatingLabel, GlassModalBlurTarget, GlassPane,
GlassSurface, LabelContent, LayoutAxisProvider, LoopView, OverlayProvider, Portal, RippleClip
and ThemeProvider. Each is audited for its contract on the page `tools/api/manifest.ts`
documents it on, or, while that file's `PENDING_DOCS` stages its docs (K12), on the page
planned for it. The list is the material inventory's style tier less the primitives with a
component page (`STYLE_LAYER_RENDERABLES` in `tools/audit/plan-specifics.ts`), and the
checklist tests hold this paragraph to it.

## The process

1. **Capture** the before run on every platform (pending, see below) and link its contact
   sheets from each checklist.
2. **Review**: one reviewer per component reads its checklist, its contact sheets and its
   probe output, ticks what passes, and writes a finding for everything that does not, with
   the cell id as evidence.
3. **Verify**: every critical and high finding is checked by a second reader against the
   source and the photographs before anyone fixes it (`verified`).
4. **Fix** in the kit, by family, with a changeset; record the fix commit on the finding.
5. **Re-capture** the component (`--only=<slug>`), compare, and tick the cells the fix
   closes.
6. **Sign off** a platform when every variant cell for it is ticked, no critical or high
   finding is open, every medium or low is fixed or carries the owner's decision, and the
   run id names the after-capture run.

A decision the rubric cannot settle (a card item that cannot be matched, a DF-versus-HIG
conflict, a breaking API change) goes to the owner as a question, never into a checklist
as "by design".

## Commands

| Command | What it does |
|---|---|
| `bun run audit:checklists` | writes new checklists and regenerates the facts block and variants table of existing ones; exits non-zero naming any file it left untouched to keep a reviewer's work |
| `bun run audit:checklists:check` | fails on a route with no checklist, an orphan checklist (a `.md` file no route calls for), a stale facts block, a malformed variants, findings or sign-off row (by line number, a finding whose cell is not one of the checklist's capture ids or `source` included), variant rows that drift from the inventory, a variants table `--write` would rewrite, or a missing findings table or sign-off section; runs in CI (`validate.yml`) and the pre-push hook |
| `bun run audit:status` | counts ticked variant cells per platform, ticked checklist items, open findings by severity and signed-off platforms across every checklist (`--json` for the rows); lists any row or table it cannot read by file and line under the counts, and exits non-zero when there is one, since the counts then under-report |
| `bun tools/audit/facts.ts <slug>` | prints one component's facts as JSON |
| `bun run audit:native:build -- --platform=ios,android` | builds the Canvas Audit app (the docs with the capture driver) in Release and installs it on the booted simulator and emulator, leaving the docs app's own `docs/ios` and `docs/android` as they were; `--incremental` reuses the parked native project while the native inputs are unchanged, `--dev` builds Debug for the fix loop |
| `bun run audit:native -- --platform=ios,android` | photographs every component example and every pattern and template page on the devices in all six looks and surfaces; `--only`, `--looks`, `--surfaces`, `--a11y=none\|default\|all`, `--devices`, `--dev`, `--keep-motion` |
| `bun run audit:web` | captures the web cells into a new run under `.audit/runs/` (see "Capturing on the web" below); `--only`, `--variants`, `--looks`, `--surfaces`, `--widths` narrow it, `--axe`, `--base`, `--workers` and `--allow-stale` tune it, `--help` lists them |
| `bun run audit:analyze` | writes `analysis.json` beside the newest capture of every cell (see "Analysis, contact sheets and the index" below) |
| `bun run audit:sheets` | writes the contact sheets under `.audit/current/<slug>/sheets/` |
| `bun run audit:index` | writes `.audit/current/<slug>/index.md`, `SUMMARY.md` and `current.json` |
| `bun run audit:prune` | deletes old runs, keeping the newest two captures of every cell (`--keep`, `--dry-run`) |

The last four take `--only=<slugs>` (component slugs, page ids such as `template-signin`, or a
page's slug; an unknown name is refused) and `--run=<run ids>` (a run's directory name, or a
prefix naming exactly one).

When a kit change alters a fact (a new test, a skin that stops aliasing the web skin, a
reference row, a materials entry), run `bun run audit:checklists` and commit the result,
the way `docs:gen` is run after a markdown change.

## Capturing on the web

`bun run audit:web` (`tools/audit/run-web.ts`) captures the web cells of the matrix above
with Playwright (`playwright.audit.config.ts`, `e2e/audit/`; `bun run e2e` never runs it):
Chromium at device scale 2, reduced motion, the page clock fixed at the suite's
`FIXED_TIME`, 6 workers (`--workers`); the manifest records those settings as read off the
configuration and `FIXED_TIME` themselves. It serves `docs/dist` through the suite's own
export server on 4173 (reused when one is already up), or captures whatever `--base` names.

Only this checkout's source is captured. Before the first cell the run opens
`/testing/diagnostics` on the server it is about to capture and tells two kinds apart by how
the page gets its code. A **static export** (the hashed files `bun run build:web` writes) is
frozen when it is built, so its source fingerprint (`docs/scripts/build-info.cjs`) must be
this checkout's: build the export first (`cd docs && bun run build:web`). A **live dev
server** (Metro: `bun run dev` in `docs/`, `--base=http://localhost:8081`) builds the page's
bundle from the source on disk when it is asked for it, so its fingerprint says nothing and
is not compared; the run is recorded as a `live dev server`, and the project root Metro's
`/status` names must be this checkout's `docs/`, since another checkout's Metro (the main
checkout's, seen from a worktree) shows that checkout's source. Either mismatch refuses the
run unless `--allow-stale`.

One Playwright test covers a component in one look and surface and loops its variants by
widths. Every cell is a fresh load in its look (`gotoDocs`), then, structure first: the page
must still be at the example's own address and the example rail must have exactly that
example's label selected, so a silent redirect fails the cell instead of photographing the
wrong example. Then the card is fitted into the viewport and photographed once, and probed.
A cell that fails is recorded as failed with its reason (and a `failure.png` of the page when
one can still be taken); the run moves on.

A run is `.audit/runs/<stamp>-web-<sha7>/`:

- `manifest.json`: the command, the checkout (sha, dirty, version), the capture settings
  (browser, device scale, reduced motion, the fixed clock, the launch switches), what was
  served (`static export` or `live dev server`, its bundle, its project root, the identity
  `/testing/diagnostics` reports, and the verdict with what it compared), the filters, the
  planned and captured counts, the flags, the time per cell, the disk use and every
  failure. Written when the run starts (`running`) and again when it ends (`complete`,
  `incomplete`, `interrupted` or `refused`).
- `cells.jsonl`: one line per cell as it finishes (id, status, error, flags, time, bytes).
- `web/<slug>/<variant>/<width>.<look>.<surface>/card.png`: the preview card, all three
  platform rows.
- `.../probe.json`: the card's and each row's boxes (the row crops are cut later), each
  row's `ariaSnapshot()`, its material effects (`readMaterialEffects`) and the in-page probe
  (`e2e/support/audit-probes.ts`, judged by `tools/audit/probe-math.ts`): every text with its
  size as painted (its computed size times the scale every transform above it paints its
  glyphs at, so a floated label laid out at 16 px reads 12; the computed size and the scale
  are kept beside it), rendered weight, family, colour, the background composited from the
  DOM under it or `indeterminate` with the reason (a backdrop filter, a gradient, an image),
  its contrast and the ratio it owes, the type floors (both judged on the painted size),
  clipping and truncation. A form control's own text is one of them, marked `field`: a text
  field's value (a password's as its bullets) or its placeholder while it shows (in its
  `::placeholder` colour, opacity and font), and a drop-down select's chosen label, each on
  the control's own background; a field's value that runs past its box scrolls, so it is
  counted as scrolled, while a cut placeholder is clipped. Beside the texts: every
  interactive element with its role, name, state (a native `disabled` or `readonly`
  included) and visible box against 44 pt (iOS row) or 48 dp (Android row),
  labelled "hitSlop unobservable", or WCAG 2.5.8's 24 px (web row); how far the document,
  the page scroller, the card and each row overflow; axe on the web row (by default solid
  cells at phone and desktop width, every look; `--axe=all`, `--axe=none` or a list of
  widths); and the page's console, CSP and request problems during the cell.

A cell is flagged `render-failed`, `problems`, `text-floor` (under 10 px), `contrast`,
`clipped-text`, `small-target` (web), `small-visible-target` (iOS or Android visible box),
`overflow` or `axe`; the summary counts the rest (text under the 12 px body floor, which
small and caption roles may be, scrolled and truncated text, contrast the DOM cannot
resolve, which the analysis step samples from the photograph).

## Capturing on devices

The docs app photographs itself on the booted iOS simulator and Android emulator. A
separate app, **Canvas Audit** (`com.nannier.canvas.audit`, URL scheme `canvas-audit`), is
the docs app built with `CANVAS_AUDIT_BUILD=1` (its identity, updates off, and the two
config plugins under `docs/plugins/`: cleartext HTTP to loopback, and the Release Gradle
daemon's memory) and `EXPO_PUBLIC_CANVAS_AUDIT=1` (the driver). It installs beside the
docs development app `com.nannier.canvas` that the Preview links open and never replaces
it; giving it its own scheme keeps `canvas://` links unambiguous on both platforms.

1. `bun run audit:native:build -- --platform=ios,android` runs `expo prebuild --clean` and
   `expo run:<platform>` in Release with `--no-bundler`, so the bundle is embedded and is
   exactly this checkout. iOS is built for the generic simulator destination into
   `.audit/builds/ios` and installed with `simctl install`: installed by Expo, the app is
   opened on a dev-client URL it cannot handle, and iOS leaves an "Open in Canvas Audit?"
   alert over every app on the simulator. `--dev` builds Debug, which loads its bundle
   from Metro on 8081, so Metro must be the one started in this checkout with both flags.

   The audit's native projects never stay in `docs/`. Expo generates and builds a project
   only at `docs/ios` and `docs/android`, and `expo run:ios` (the docs' `bun run ios`)
   prebuilds only when that directory is missing (`ensureNativeProjectAsync` in
   `@expo/cli`), building whatever is there otherwise, so an audit project left in
   `docs/ios` would be what the next `bun run ios` built and installed as
   `com.nannier.canvas.audit`. A build therefore sets the docs app's own project aside in
   `.audit/native/docs-<platform>`, generates (or reuses) the audit project in
   `docs/<platform>`, builds, then parks the audit project in `.audit/native/<platform>`
   and renames the docs project back, untouched, whether the build succeeded, failed or was
   stopped with Ctrl-C. When there was no docs project, `docs/<platform>` is left empty
   and the next `bun run ios` prebuilds the docs app as usual. A build killed outright
   (`kill -9`, a crash) leaves both directories where the next build finds them and puts
   right before it starts; it refuses, touching nothing, if `docs/<platform>` meanwhile
   holds another non-audit project. While a build runs, `docs/<platform>` is the audit's,
   so do not run the docs' own native build in the same checkout at the same time.

   The generated project records, in `canvas-audit.json`, the native fingerprint it was
   generated from (`nativeFingerprint` in `docs/scripts/build-info.cjs`: `docs/app.json`,
   `docs/app.config.js`, `docs/plugins/`, `docs/patches/`, `docs/package.json`,
   `docs/bun.lock` and the local native modules under `packages/`, their build products and
   installs left out), and the build stamps it into the app's `extra.canvasBuild` beside
   the source fingerprint (`CANVAS_AUDIT_NATIVE_FINGERPRINT`, read by `docs/app.config.js`).
   `--incremental` reuses the parked project, so a JS-only change rebuilds in a minute or
   two, only while this checkout's native fingerprint is the one the project was generated
   from; otherwise the build says why and prebuilds afresh.
2. `bun run audit:native -- --platform=ios,android` starts the host on `127.0.0.1:8791`
   (`tools/audit/native/server.ts`), puts each device into its capture state, launches the
   app, and serves it the queue: every component example and every pattern and template
   page, look-major (all of blush solid, then blush glass, and so on, so the theme changes
   six times a run). The app's driver (`docs/src/audit/driver.native.tsx`) says hello with
   its build identity, and the host refuses a build whose source fingerprint or native
   fingerprint (`docs/scripts/build-info.cjs`) is not this checkout's, or that carries no
   native fingerprint, a downloaded update, and a Debug build unless `--dev` asked for one;
   any of these ends that platform's run. A hello from another app carrying the driver (a
   docs development build on a Metro started with the audit flag) is answered with a
   refusal and logged, and the audit app's run goes on.
3. For each item the driver sets the look through the docs theme's own setters (only the
   axes that change) and waits until the kit's `useTheme()` reports it, `router.replace`s
   to the example's route, waits for the pathname and for the Playground to register the
   card with the example's label (`docs/src/audit/probe-context.tsx`; a pattern or template
   page registers itself), lets the JS thread go idle (`requestIdleCallback`, React
   Native 0.86's replacement for the deprecated `runAfterInteractions`), three frames and
   the host's settle time, then scrolls the card to the top of the visible band and
   posts one `/ready` per segment (a card taller than the band is taken in segments and
   stitched).
4. The host checks each segment before it photographs it: the look the kit's `useTheme()`
   resolved (scheme, surface, palette, and a dark flag that agrees with the scheme), the
   router's pathname and the Playground's example label must be the item's (a pattern or
   template page must have registered itself). The driver waits for the same things
   before it posts; the host checks rather than trusts, and a mismatch fails the attempt
   with the difference as its reason (`verify: ...`) before any shot is taken. It then
   grabs the screen until two grabs in a row agree on the card's rows (mean difference at
   most 0.1 on a 128 px grayscale thumbnail; a card that never holds still after five
   grabs is kept and marked `unstable`), cuts the card out by its rect, and on the cells
   the `--a11y` policy names dumps the accessibility tree inside the card (Android: UI
   Automator; iOS: the pinned Maestro's `hierarchy`, which reads XCUITest's tree).
5. An item gets 30 s of the driver's time and a second attempt. The host's own work on an
   item (its grabs, its accessibility dump, writing its card) is not the driver's time,
   finished or still in flight, so a slow animated card is marked `unstable`, never failed
   for the host's slowness. A stalled app (an item past its time, an app that stops asking
   for items or never says hello) is relaunched; after three relaunches in a row during
   which the app never took an item, the platform's run is abandoned with the reason in
   the console, the manifest (`abandoned`) and the exit code, so an unattended sweep always
   finishes. A failed relaunch counts as one that did not bring the app back.

The card's rect is computed, not read from the screen: its layout within the scroller's
content (`measureLayout`) and a scroll offset the driver sets itself. Read with
`measureInWindow` on iOS, a card came back 158 and 274 points above where it was drawn,
because the scroller's content offset under the automatic inset adjustment is not the one
Fabric's layout reads. The offsets run past the content's own range by the bars lying
over the scroller, to where a user's scroll rests on iOS (the content's top just under the
transparent header, its bottom just above the tab bar); React Native's `scrollTo` clamps
those away, so the page frame allows overflow in the audit build only. Without it the last
83 points of every iOS page (the tab bar's height) could not be brought into the band. The visible band is the narrowest of the screen's frame, the window
safe area and the stack header's height, and on iOS the tab bar, which no source inside the
app reports (a safe area read inside the screen comes back with the window's insets only):
the host reads the tab bar's frame from the accessibility tree once per run and sends it
with every item. iOS runs therefore need Maestro: `node scripts/install-maestro.mjs
.audit/tools/maestro-2.10.0` (JDK 17, from `JAVA_HOME` or `/opt/homebrew/opt/openjdk@17`).

The device changes a run makes, each read first and restored on the way out (success,
failure or Ctrl-C), and listed in the run's manifest: iOS, a 9:41 status bar override
(left alone if someone else's override is in place) and Reduce Motion on through `simctl
spawn defaults`; Android, `adb reverse tcp:8791`, System UI demo mode (9:41, full battery
and signal, no notifications) and the three animation scales at 0, which React Native
reads as reduced motion. `--keep-motion` leaves the motion settings alone.

A run writes one directory per platform:

```
.audit/runs/<stamp>-<ios|android>-<sha7>/
  manifest.json      device, app build identity, both fingerprints, options, device changes made and undone,
                     counts, timings, and why the run ended early (refused, abandoned) if it did
  cells.jsonl        one line per cell as it finishes: status, attempts, seconds, segments, a11y,
                     and when it finished (`at`; a run recorded before the stamp has none)
  driver-log.jsonl   console problems the app raised between items
  <platform>/<slug>/<variant>/<look>.<surface>/
    screen.png       the whole screen (screen-2.png and on for later segments)
    card.png         the card, stitched from its segments
    probe.json       the item, the resolved look, region, band and its sources, scroll offset,
                     grabs and their differences, console problems, timings
    a11y.json        the accessibility nodes inside the card, when the policy asks for them
  <platform>-pages/<kind>-<slug>/<look>.<surface>/...
```

Nothing of the driver ships anywhere else. The root layout requires it only inside
`if (process.env.EXPO_PUBLIC_CANVAS_AUDIT === "1")`, which Expo inlines and Metro folds
away in every other production bundle, and `tools/docs/audit-driver-bundle.test.ts` keeps
that the only way in. Expo does not key Metro's transform cache on `EXPO_PUBLIC_`
variables, so `docs/metro.config.js` adds the flag to the cache version: without it a
flagged export run after an ordinary one reused the ordinary transform of the root layout
and carried no driver.

### Native spike (2026-10-09)

Recorded on the iPhone 17 Pro simulator ("Canvas Audit", iOS 27.0) and the `canvas_audit`
AVD (Pixel-class 1080x2400 at 420 dpi, Android 15, API 35), both booted with the docs
development app installed.

- **HTTP in Release.** Reachable on both. The iOS simulator shares the Mac's loopback; the
  emulator reaches it through `adb reverse`, with `usesCleartextTraffic` from the config
  plugin. With updates off, expo-updates reports no update id and a non-embedded launch,
  so the host refuses only an update id with a non-embedded launch.
- **Seconds per shot** (`--only=button,switch --a11y=default`, 126 cells per platform, both
  platforms at once, 17 minutes): iOS 1.8 s a cell (median; 95 cells) and 8.5 s with an
  accessibility dump (31 cells); Android 7.0 s and 10.4 s. At those rates a full sweep's
  3,666 variant cells a platform, 1,131 of them with a dump under the default policy, take
  about 4 hours on iOS and 8 on Android, run side by side, before the 144 page cells (not
  yet timed; a page is several segments). Android's floor is `adb exec-out screencap`
  itself, 1.5 to 2.1 s a grab on this emulator, raw or PNG; the emulator console's `adb
  emu screenrecord screenshot` takes 0.43 s but its pixels differ from the device's own
  composite (mean difference 0.57, 1.3 million of 7.8 million bytes), so the host keeps
  screencap. A Maestro dump costs iOS about 7 s a cell and UI Automator about 3.5 s on
  Android, which is why the default `--a11y` policy dumps every variant only in blush
  solid.
- **Reduce Motion through `simctl spawn defaults`.** Works: written before launch, the
  app's `AccessibilityInfo.isReduceMotionEnabled()` reports true, and restoring the
  previous value at exit works.
- **Android glass under `-gpu host`.** Measured on 2026-10-09 with the emulator on the
  host GPU (`dumpsys SurfaceFlinger`: `GLES: Google (Apple), Android Emulator OpenGL ES
  Translator (Apple M4 Pro), OpenGL ES 3.0 (4.1 Metal - 91.7)`, also in each run's
  manifest under `device.details.renderer`). The Playground cards are still the solid
  treatment under glass, so the GPU was never the cause. Mean absolute difference per
  channel between the glass and solid `card.png` of the same cell, and the share of pixels
  that differ:

  | Cell | Blush | Dark |
  |---|---|---|
  | Android `button/default` | 0 (0 pixels) | 0 (0 pixels) |
  | Android `chip/emphasis` | 2.50 (1.42%) | 0.65 (1.42%) |
  | Android `tooltip/default` | 0.006 (0.02%) | 0.007 (0.02%) |
  | iOS `chip/emphasis`, for comparison | 3.09 (98.1%) | 14.7 (98.3%) |
  | iOS `tooltip/default`, for comparison | 7.26 (98.8%) | 22.7 (98.9%) |

  Every other Android Button variant compared (outline, secondary, destructive, ghost) is
  byte-identical too. The chip's difference is not the material: it is a black 1 dp ring
  just inside the Neutral and Accent chips (and every status chip) under glass, and the
  tooltip's is the bubble's corner antialiasing. The cause is in the kit's material
  resolution, by design. On Android `materialCapabilities()`
  (`src/style/glass-surface/material-runtime.android.ts`) reports `requiresTarget: true`,
  twice over: `@nannier/canvas-blur` is autolinked from `packages/` and reports `supported`
  on API 31 and up (`nativeCaptureAvailable`), and expo-blur 57 exports `BlurTargetView`
  (`requiresBlurTarget`). `resolveMaterial` (`material-resolution.ts`) then resolves any
  glass surface without a safe capture target to `solid` with the fallback
  `missing-target`, and only two places publish a target (`GlassBlurTargetContext`): an
  `OverlayProvider` publishes its own content plane to its outlet alone, and only when its
  host style grows (`blurTargetMountable` in `glass-blur-target.android.tsx`, `portal.tsx`),
  and `GlassModalBlurTarget` bridges the window target into a Drawer's or ActionSheet's
  Modal. A surface in the page, the docs stage and everything on a Playground card
  included, has none, since sampling an ancestor plane would be a render-node cycle
  (`glass-surface.shared.tsx`: "Targetless surfaces resolve to their complete solid
  skin"). The Tooltip bubble is drawn in flow beside its trigger, not in the outlet, so
  it is a page surface too. The theme is not the cause: the platform default (solid on
  Android) never applies, because the docs theme passes `glass` explicitly
  (`<ThemeProvider glass={surface === "glass"} ...>` in `docs/src/theme/docs-theme.tsx`),
  and the host checks that every glass cell's `useTheme()` resolved `glass`. Where a target
  exists the frost does render on the host GPU: the Popover's panel, opened by hand in the
  audit app on `/components/popover` in the dark scheme, is a portaled overlay drawn in an
  outlet with a capture target, and under glass it is frosted, the colours behind it
  blurred through, differing from solid by 11.0 a channel over 97.6% of the panel. The capture photographs
  only resting examples, none of which opens a portaled overlay, so the Android sweep shows
  that frost nowhere yet.

  The black ring is a kit defect the audit has to record, not a capture artifact: Chip
  reads its paint from `useMaterialTheme`, which demotes the surface to solid, but its
  `GlassPane` reads `useTheme()`, still sees glass, and mounts a `GlassSurface` that
  resolves solid and paints the pane's own shape as a plain view. That shape is the
  skin's `base` (`androidBase` in `src/atoms/chip/chip.styles.ts`), which carries
  `borderWidth: 1` but no `borderColor` (the colour is set on the chip's `chrome` from its
  tone), so Android draws the default black border. Button passes its resolved container
  style as the pane's shape, which is why its cards stay byte-identical.
- **Pages.** `pattern-glass` and `template-signin` in dark glass: iOS 2,350 points of the
  sign-in page in 4 segments, Android 2,075 dp in 3, stitched without a seam; 8 s a page on
  iOS and 25 s on Android (each segment is two grabs).
- **Stability.** Every Button and Switch card held still between the first two grabs (the
  largest difference 0.06 on iOS and 0 on Android, against the 0.1 threshold), so no cell
  needed a third grab and none was marked unstable.

## Analysis, contact sheets and the index

Three commands turn the runs into what a reviewer reads, and a fourth keeps the disk in
check. All four read the runs through one module (`tools/audit/runs.ts`), so they agree on
what the **current capture** of a cell is: the newest one across every run under
`.audit/runs/`, by when its record says it finished (`at`, which the web cells and the
native host both write; a native record older than that stamp takes its run's start), then
its run's start, then its line in `cells.jsonl`. A partial re-capture (`--only`,
`--variants`) therefore replaces exactly the cells it took, and every other cell stays at
the run that took it last. The newest record wins whatever its status: a cell that failed on
its latest capture shows as failed, not as an older photograph. The readers already know the
interaction-state and page layouts (`web-states/<slug>/[<variant>/]<state>/<leaf>`,
`<platform>-pages/<kind>-<slug>/[<section>/]<leaf>`, a record whose status or flag is
`state-not-reached` having no photograph), so those runs are taken in when they exist.

1. `bun run audit:analyze` (`tools/audit/analyze.ts`) writes `analysis.json` beside each
   current cell's `probe.json`. Derived data: it is rewritten on every run, since a cell's
   structure verdict depends on its peers' current captures.
   - **Contrast.** Where the probe resolved a text's background from the DOM, its verdict
     stands (method `dom`: fail under the 4.5 or 3 it owes). Where the DOM could not say (a
     backdrop filter, a gradient, an image: every glass cell), the text is sampled from
     `card.png` (method `pixels`): its box in device pixels, narrowed to the ink inside it
     (every pixel at least 1.25 in contrast from the box's median, one pixel of margin), and
     the 10th and 90th luminance percentiles of that read as ink and background. Sampling
     reads thin glyphs low, so it never says "fail": under 8/9 of what the text owes (4.0 for
     4.5, 2.67 for 3) is `fail-likely`, from there to what it owes `review`. A disabled
     control's text owes nothing (WCAG 1.4.3's inactive exception); a text something paints
     over, or one scrolled partly out of its scroller's view, is not sampled. Calibrated on
     the solid cells of the run below, where the DOM gives the answer, over 5,199 texts: the
     pixel reading was never more than 1.1% above the DOM's, all 12 DOM fails read
     `fail-likely`, and of 5,187 DOM passes 10 read `fail-likely` and 39 `review` (the worst
     a two-line email whose ragged second line leaves the ink a small share of its box).
     Without the narrowing to the ink, 102 passes read `fail-likely`.
   - **Type.** The smallest painted size (the probe's computed size times its glyph scale)
     and the counts under the 10 px source floor and the 12 px body floor.
   - **Targets.** Per row of the browser card, the interactive boxes under 24 px (web), 44 pt
     (iOS) and 48 dp (Android; a hitSlop is not observable); on an Android device, the nodes
     a user acts on (clickable or checkable) under 48 dp in the accessibility dump.
   - **Structure invariance.** The web row's `ariaSnapshot()` must be the same across the
     looks and surfaces of one variant at one width. The most common snapshot of the group
     is the group's (a tie goes to blush solid's); a cell that differs is flagged
     `structure-varies` with the first line that differs.
   - **Native accessibility.** Android: every clickable or checkable node is named by its
     own label or by a named node inside it, as TalkBack reads it. iOS: XCUITest through
     Maestro reports no traits, so the check is that no element is announced by its value
     alone.
   - **Flags.** The capture's own (`render-failed`, `problems`, `text-floor`, `contrast`,
     `clipped-text`, `small-target`, `small-visible-target`, `overflow`, `axe`) and the
     analysis' (`contrast-likely`, `contrast-review`, `structure-varies`, `state-not-reached`;
     on a device `failed`, `unstable`, `problems`, `a11y-unnamed`, `a11y-error`,
     `small-visible-target`).
2. `bun run audit:sheets` (`tools/audit/sheets.ts`) writes JPEG contact sheets under
   `.audit/current/<slug>/sheets/`: per variant `card-solid.jpg` and `card-glass.jpg` (the
   browser card, widths x looks), `row-<ios|android|web>-<width>.jpg` (one row of the browser
   card cut at its box in `probe.json`, looks x surfaces), `native.jpg` (the iOS and Android
   device cards x the six looks and surfaces), `compare.jpg` and `compare-glass.jpg` (per
   look, the browser's iOS row at phone width beside the iOS device's card, and the same for
   Android); per component `states.jpg` (`states-<width>.jpg` for further widths) when states
   were captured. Every tile is labelled with its cell id; a cell that failed, was not
   reached or was never captured is a labelled placeholder. No sheet's long edge passes
   1600 px: the tiles share one scale (relative sizes stay true, a phone card narrower than a
   desktop one), no more than the sharpest source's own density, in whichever orientation
   scales them larger. A sheet with no picture is not written, and a variant's sheets
   directory is emptied before it is written. The 3 x 3 card sheets of a tall card are an
   overview of the layout only (data-table's `stacked` card sheet tiles at 0.26 px a CSS px);
   its row sheets are where its text is read.
3. `bun run audit:index` (`tools/audit/index.ts`) writes `.audit/current/<slug>/index.md` per
   component, pattern or template: the checklist, the sheets, the runs its cells come from
   (commit, source fingerprint, what served them), its flag counts, and one row per cell
   with its status, flags, axe violations by impact, smallest painted font, contrast (DOM
   fails, pixel fail-likely, pixel review), overflow, clipped text, small targets, console
   problems, a state not reached, and its run, commit and fingerprint. `SUMMARY.md` ranks every
   captured component by its cells' flags and names the ones never captured; `current.json`
   is the same selection for tools. A cell's flags are its analysis' when the analysis is of
   that capture, else the capture's own, and the index says how many are not analyzed.
   `--only` narrows the `index.md` files written; `SUMMARY.md` and `current.json` are always
   rebuilt whole.
4. `bun run audit:prune` (`tools/audit/prune.ts`) deletes a run only when nothing a reviewer
   needs is in it: it is not one of the newest `--keep` (default 2) runs of its platform, it
   has finished, and every cell it holds has at least `--keep` newer captures in other runs.
   The newest two captures of every cell (the before and the after) survive, a full sweep is
   never deleted while a later partial re-capture covers only some of it, and the current
   view never loses a cell. `--dry-run` says what would go and why the rest stays.

Measured on 2026-10-09 over `--only=button,switch,data-table` (684 web cells from a fresh
export, 126 iOS and 126 Android cells copied from the 1g runs): `audit:analyze` 2.9 s for 936
cells (5,325 texts sampled from pixels), `audit:sheets` 17.8 s for 515 sheets of 38 variants
(55 MB, 109 KB a sheet, tile scales 0.26 to 2.17 px per layout unit, median 1.08),
`audit:index` 0.2 s.

The interaction-state recipes and page shots (1d) and the fixer loop (1h) are still to come;
until the state runner lands, `states.jpg` is never written.

A fixer re-captures one component with
`bun run audit:web -- --only=<slug> --base=http://localhost:8081` against this checkout's
Metro while iterating (the run is recorded as a `live dev server`; from a worktree, start
that worktree's own docs dev server, since 8081 shows the main checkout's source), then the
same against a rebuilt export for the final check,
`bun run audit:native -- --platform=ios --only=<slug> --dev` (and `android`) on the booted
devices, and `bun run audit:sheets -- --only=<slug>` and `bun run audit:index -- --only=<slug>`
to refresh that component's contact sheets and index under `.audit/current/`.
