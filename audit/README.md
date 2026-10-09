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

Fourteen style-layer renderables have no docs route and so no checklist of their own:
GlassSurface, GlassPane, ThemeProvider, AnchoredOverlay, Portal, OverlayProvider, Entrance,
LoopView, FloatingLabel, LabelContent, RippleClip, BreakpointOverride, LayoutAxisProvider and
GlassModalBlurTarget. Each is audited for its contract and given docs (K12) on the page the
materials manifest names (`theming`, or the component page that hosts it).

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
| `bun run audit:web` | captures the web cells into a new run under `.audit/runs/` (see "Capturing on the web" below); `--only`, `--variants`, `--looks`, `--surfaces`, `--widths` narrow it, `--axe`, `--base`, `--workers` and `--allow-stale` tune it, `--help` lists them |

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

## Capturing (pending)

The rest of the capture infrastructure is not in the repository yet: the interaction-state
recipes and page shots (1d), analysis and contact sheets (1e, `audit:sheets`,
`audit:index`), the in-app native driver (1f), the native host runner and builds (1g,
`audit:native`, `audit:native:build`) and the fixer loop (1h). Until they land, the
checklists are reviewed against the web captures and the existing evidence (`bun run e2e`,
`bun run looks`, the docs three-up), and the cells are ticked only from photographs.

Once they land, a fixer re-captures one component with
`bun run audit:web -- --only=<slug> --base=http://localhost:8081` against this checkout's
Metro while iterating (the run is recorded as a `live dev server`; from a worktree, start
that worktree's own docs dev server, since 8081 shows the main checkout's source), then the
same against a rebuilt export for the final check,
`bun run audit:native -- --platform=ios --only=<slug> --dev` (and `android`) on the booted
devices, and `bun run audit:sheets -- --only=<slug>` and `bun run audit:index -- --only=<slug>`
to refresh that component's contact sheets and index under `.audit/current/`.
