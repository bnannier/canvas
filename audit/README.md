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
`android/...`; pages use `web-pages/<kind>-<slug>/...` and `<platform>-pages/...`, and the
web's interaction states `web-states/<slug>/<name>.<row>/<width>.<look>.<surface>`, the
name being the state's (`<state>-<variant>` for a state a component has several recipes of,
`<state>-<variant>-inside` for one applied inside the overlay its example opens, beside one on
that example's own surface).

A page's sections come from its data module (`docs/src/core/data/patterns.tsx` or
`templates/<slug>.tsx`), read from the source (`pageSections` in the inventory), each keyed
by its title slugified (`Live comparison` is `livecomparison`); the docs mark each section
with the same key on the web (`data-mockup-section`, `docs/src/ui/mockup-page.tsx`).

## The checklists

`audit/components/<slug>.md` (104) and `audit/pages/<kind>-<slug>.md` (24), one per docs
route, and `audit/foundation/<id>.md` (15), one per foundation (see "Foundations" below).
Each file is half generated and half hand-maintained:

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
  and whether each platform cell is a real reference link or a `none` note; every docs
  component has one, held to the skins by `test/platform-references.test.ts`); its
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
  is not a name), and the specs and sweeps that drive it. Every checklist's facts end with
  its **Turn record**: `audit/turns/<id>.md`, where `bun run audit:turn` records the
  before and after capture runs of its turn (see "One component's turn").

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
  run that shows the component passing, the reviewer, the date and the result. A row with a
  run id signs that platform off (`tools/audit/sign-off.ts`, the one reader audit:status and
  the docs gate share), and from the first one on the component's docs page must carry a
  `## Accessibility` section after Do & Don't, written from the audit's findings:
  `docs:gen` refuses the page otherwise (rule S10 in `tools/docgen/parse-md.ts`).

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

## Foundations

The Foundations tier is the style-layer renderables with no component page of their own,
AnchoredOverlay, BreakpointOverride, Entrance, FloatingLabel, GlassModalBlurTarget, GlassPane,
GlassSurface, LabelContent, LayoutAxisProvider, LoopView, OverlayProvider, Portal, RippleClip
and ThemeProvider; the design tokens the docs' `tokens/*` pages document (Tokens); and the kit
internals the generated `/foundation` reference page documents (FoundationReference). The
renderables are the material inventory's style tier less the primitives with a component page
(`STYLE_LAYER_RENDERABLES` in `tools/audit/plan-specifics.ts`), and the checklist tests hold
this paragraph to it. Each has `audit/foundation/<id>.md`, its name in kebab case
(`glass-modal-blur-target`, `tokens`, `foundation-reference`), generated and checked by the
same `audit:checklists` and `audit:checklists:check`, and counted by `audit:status`.

The tier carries the K12 items (the plan's "Foundations"): the 111 deprecations the owner
decided (K12-2, with OD4, OD5 and K12-7 OD3), their JSDoc, and the generated `/foundation`
reference page. So every name those decisions retire, each `internal-by-accident` export, each
name `DECIDED_DEPRECATIONS` adds and each deprecated alias already, is on one of its
checklists, and `audit:checklists:check` fails on one that is not (`unplacedDeprecations`).
The reference foundation is where a kit internal lands when no renderable's home and no token
module holds it: the ripple helpers, the behaviour hooks, React Native's `StyleSheet`.

A foundation has no examples of its own: it is a contract other components render through,
audited for that contract on the page `tools/api/manifest.ts` documents it on (or, while that
file's `PENDING_DOCS` stages its docs, K12, on the page planned for it) and photographed
through its consumers. So its checklist has no variants table, and its facts block
(`tools/audit/foundations.ts`) says:

- **Foundation**, **Public exports**: a renderable is the module that declares its name, on
  every platform (the declaring file of each platform build), and the public names whose way
  out of `src/index.ts` passes through that module, so FloatingLabel and LabelContent (one
  module) share their exports, and so do Portal and OverlayProvider. The design tokens are
  "whatever the docs have": the public names the API manifest documents on a `tokens/*` page
  or plans to, the kit names those pages' own sources import that are neither a component nor
  a renderable's and are not declared in a component's modules (`shadow`, which
  `/tokens/spacing` renders in its Elevation section; the cards and tables around the examples
  are the pages' frame), and every other public name of the modules those are declared in,
  the renderables' homes left out (`customShadow` and `ShadowLevel` beside `shadow`, the
  Riskora type ladder in `src/style/tokens.ts`). The reference is the public names the API
  manifest documents or plans on `/foundation` that no renderable and not the tokens hold
  (`memberships` in `tools/audit/foundations.ts`). Each export carries its
  `tools/api/manifest.ts` kind.
- **Source files**: its homes, the files declaring its exports, and the files of its
  implementation: the private declarations its exports read, through private declarations
  alone (`foundationCode` in `tools/audit/foundations.ts`). A declaration is private when no
  public export resolves to it, it is outside every component's own modules, and no
  component's own module reads it (a hook every component calls is shared vocabulary, no one
  foundation's code). So GlassSurface's list holds its shell (`glass-surface.shared.tsx`), its
  material runtime and the web frost (`web-frost.ts`, a tuning-harness tunable), and
  BreakpointOverride's holds `breakpoint-override.ts`, the context its hooks resolve.
- **Seams**: the implementation it owns, by its readers (`ownersByReaders` in
  `tools/audit/kit-graph.ts`): a private declaration is a foundation's when every reader of it,
  among the foundations' exports and the private declarations they own, is that foundation's;
  one reader that is shared (the overlay layer, which Portal and AnchoredOverlay both publish
  through) or shared vocabulary leaves it nobody's. A relay does not count as a reader: a
  declaration that reads a context and provides it again (`usePortalMount` carrying the
  publisher's breakpoint, readiness and theme into a portal) carries the context's owner, so
  BreakpointOverrideContext stays BreakpointOverride's and the overlays the layer publishes
  are its consumers.
- **K12-2 status**: each export a deprecated alias to come (an `internal-by-accident` name,
  K12-2, or one the owner's decisions retire: the shadow helpers, K12-2 OD4; React Native's
  pass-throughs, OD5; the Riskora type ladder, K12-7 OD3), a deprecated alias already, or
  public (ThemeProvider and its types stay public).
- **Documented on**, **Docs planned**: the manifest's `docs` routes (with their sections) and
  its `PENDING_DOCS` routes, a planned page not built yet said so (`foundation`, K12-10).
- **Materials manifest**: its `tools/materials/manifest.ts` entry (Tokens and the reference have
  none).
- **Tests of it**: the test files importing one of its public exports by name (from the kit's
  entry or any kit module, by the same reader the component facts use), or one of its
  implementation's declarations by name from a module that resolves it there
  (`test/glass-surface.test.ts` imports the shell's `specularRim`), and the test files named
  for it, `test/<id>.test.tsx` or `test/<id>-<what>.test.tsx`
  (`test/anchored-overlay-dismissal.test.tsx`, which tests AnchoredOverlay through the
  consumers it renders). A module's path alone does not count: glass-surface.shared.tsx is
  GlassModalBlurTarget's home and also the GlassSurface shell's.
- **Consumers**: every kit component that renders through it, read from the source by the
  consumer reader, `tools/audit/kit-graph.ts`, and listed one row each under the facts table
  with how it gets there. The reader parses every module under `src/` (never runs one) and
  links each top-level declaration to the names its code reads, resolved by the module's own
  scopes (a parameter that shadows an import is not the import) and followed through every
  re-export (the internal hub `src/style/index.ts` included) to the declarations they name, on
  every platform at once (`./glass-surface.js` is glass-surface.tsx, .ios.tsx and .android.tsx).
  A type is never an edge, a package ends the walk, and a module's top-level statements are a
  node every declaration of the module reads. The foundation is reached at its public values
  and its seams. A component reaches a foundation **directly** when its own modules read one
  of the foundation's public values (Card and Dialog read GlassSurface; Popover, Dropdown and
  Select read AnchoredOverlay), **through shared modules** when it reads a declaration of a
  module no component directory owns (the style layer, `src/charts/shared`) that leads there
  through such modules alone (Button reaches GlassSurface through GlassPane; Dropdown and
  Dialog reach BreakpointOverride through AnchoredOverlay and Portal, whose overlay layer
  relays its context), and **through other kit components** when the only way
  there is another component's directory (Avatar reaches AnchoredOverlay through Dropdown,
  for AvatarMenu). A primitive built in a style module (Text, Pressable) is a component like
  any other, and its module is shared for everyone else. What the reader cannot follow (a
  relative `require()` or `import()`, a specifier that names no module, `export * as`) fails
  with the file and line rather than drop an edge.
- **Pages using it**: the pattern and template pages whose own entry names one of its exports
  (`pattern-glass` names ThemeProvider and useTheme).
- **Capture through**: what its captures are: the consumers in that order (direct, then
  through shared modules, then through other kit components, each in the docs' order), then
  the pages that use it or document it. `bun run audit:turn -- --slug=<foundation>` expands to
  this list. A page that only composes consumer components shows the foundation through them,
  and they are captured as themselves.
- **Not captured**: the guide pages that document it or are planned to (`/theming`,
  `/integration`, the `tokens/*` pages, `/foundation`), which the capture inventory, component,
  pattern and template pages alone, does not hold: no runner photographs them yet, so a turn
  reads them on the live docs.
- **Turn record**: as every checklist's.

Its hand-maintained sections are seeded from `tools/audit/plan-specifics.ts`: the universal
rubric adapted for a style-layer contract (`FOUNDATION_RUBRIC`: API and contract, docs,
platform truth, materials, the accessibility it provides or must not break, performance,
tests), its specific checks (`FOUNDATION_PLANS`: the plan's row, the owner's decisions that
concern it, its materials target, and the re-capture of its consumers), then the findings and
sign-off tables in the components' format. A finding's Cell is a capture id of one of its
Capture through slugs, or `source`; a platform is signed off on the after-phase runs that show
every slug of its list.

## The process

1. **Capture** the before run on every platform (`bun run audit:turn -- --slug=<slug>
   --phase=before`, see "One component's turn"); the turn record lists its runs and the turn
   prints the contact sheets to read.
2. **Review**: one reviewer per component reads its checklist, its contact sheets and its
   probe output, ticks what passes, and writes a finding for everything that does not, with
   the cell id as evidence.
3. **Verify**: every critical and high finding is checked by a second reader against the
   source and the photographs before anyone fixes it (`verified`).
4. **Fix** in the kit, by family, with a changeset; record the fix commit on the finding.
5. **Re-capture** the component (`bun run audit:turn -- --slug=<slug> --phase=after`),
   compare, and tick the cells the fix closes.
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
| `bun run audit:checklists:check` | fails on a deprecation the owner decided that no Foundations checklist holds, a route or foundation with no checklist, an orphan checklist (a `.md` file no route or foundation calls for), a stale facts block, a malformed variants, findings or sign-off row (by line number, a finding whose cell is not one of the checklist's capture ids or `source` included), variant rows that drift from the inventory, a variants table `--write` would rewrite or a foundation's checklist should not have, a missing findings table or sign-off section, and a turn record under `audit/turns/` that names no checklist or has a row it cannot read; runs in CI (`validate.yml`) and the pre-push hook |
| `bun run audit:status` | counts ticked variant cells per platform, ticked checklist items, open findings by severity and signed-off platforms across every checklist, the foundations' included (`--json` for the rows); lists any row or table it cannot read by file and line under the counts, and exits non-zero when there is one, since the counts then under-report |
| `bun tools/audit/facts.ts <slug>` | prints one component's facts as JSON |
| `bun run audit:turn -- --slug=<slug> --phase=before\|after` | one component's, page's or foundation's turn capture: every web and device capture of the slug (a foundation's Capture through list), the analysis, sheets and index scoped to it, the run ids recorded in `audit/turns/<id>.md`, and the sheets to read printed (see "One component's turn"); `--dry-run`, `--web-only`, `--native-only`, `--only-first=<n>`, `--no-build`, `--devices`, `--workers` |
| `bun run audit:native:build -- --platform=ios,android` | builds the Canvas Audit app (the docs with the capture driver) in Release and installs it on the booted simulator and emulator, leaving the docs app's own `docs/ios` and `docs/android` as they were; `--incremental` reuses the parked native project while the native inputs are unchanged, `--dev` builds Debug for the fix loop |
| `bun run audit:native -- --platform=ios,android` | photographs every component example and every pattern and template page on the devices in all six looks and surfaces; `--only`, `--looks`, `--surfaces`, `--a11y=none\|default\|all`, `--devices`, `--dev`, `--keep-motion` |
| `bun run audit:web` | captures the web cells into a new run under `.audit/runs/` (see "Capturing on the web" below): the example variants, or with `--states` (every state, or `--states=hover,open`) the interaction states and with `--pages` the pattern and template pages instead (both flags for both); `--only` (component slugs, page ids or page slugs, read as below), `--variants` (the variant capture only), `--looks`, `--surfaces`, `--widths` narrow it, `--axe`, `--base`, `--workers` and `--allow-stale` tune it, `--help` lists them |
| `bun run audit:analyze` | writes `analysis.json` beside the newest capture of every cell, variant, interaction state, page or device cell (see "Analysis, contact sheets and the index" below) |
| `bun run audit:calibrate` | measures the analysis' contrast read from the photographs (cards, state shots, page sections) against the DOM's, on the newest captures; writes nothing |
| `bun run audit:sheets` | writes the contact sheets under `.audit/current/<slug>/sheets/`: per variant, per component's states, per page |
| `bun run audit:index` | writes `.audit/current/<slug>/index.md` (a component's cells and states, a page's cells and sections), `SUMMARY.md` and `current.json` |
| `bun run audit:prune` | deletes old runs, keeping the newest two captures of every cell, and rebuilds the index over what remains (`--keep`, `--dry-run`) |

The last five take `--only=<slugs>` and `--run=<run ids>` (a run's directory name, or a prefix
naming exactly one). Every command that takes a name (`--only` here, on `audit:web` and on
`audit:native`, and `audit:turn`'s `--slug`) reads it the same way (`resolveNames` in
`tools/audit/inventory.ts`): a component slug names that component and nothing else, since a
component has no other name; a page id (`template-signin`) names that page; and a page's slug
(`signin`) names the page only when no component has that slug and no other page shares it.
So `calendar` is the Calendar component, and its template page is `template-calendar`; a page
is matched by its id, never by a suffix of it (`sidebar` is not `template-detail-sidebar`). An
unknown name, and a page slug two pages share, is refused.

When a kit change alters a fact (a new test, a skin that stops aliasing the web skin, a
reference row, a materials entry), run `bun run audit:checklists` and commit the result,
the way `docs:gen` is run after a markdown change.

## One component's turn

The audit goes one component at a time (the plan's "Execution model"), and each turn takes a
before and an after capture of its slug. One command takes either:

```sh
bun run audit:turn -- --slug=button --phase=before          # step 1, Before
bun run audit:turn -- --slug=button --phase=after           # step 5, Verify
bun run audit:turn -- --slug=button --phase=before --dry-run   # the plan, nothing run
bun run audit:turn -- --slug=glass-pane --phase=before      # a foundation: its Capture through list
bun run audit:turn -- --slug=template-signin --phase=after  # a page (or --slug=signin)
```

The plan's turn, with the commands that carry it out:

1. **Before.** `bun run audit:turn -- --slug=<slug> --phase=before`. This is the plan's
   `audit:web -- --only=<slug>`, `audit:web -- --states --only=<slug>`,
   `audit:native -- --platform=ios,android --only=<slug>`, then `audit:analyze`,
   `audit:sheets` and `audit:index` for the slug, run in that order by one command.
2. **Review.** The reviewer reads the checklist, `.audit/current/<slug>/index.md` and the
   sheets the turn printed, the source, the `.md`, and the probe JSON of the cells the index
   flags.
3. **Decide.** Owner questions, batched.
4. **Fix**, with `bun run audit:checklists` when a fact changes.
5. **Verify.** `bun run audit:turn -- --slug=<slug> --phase=after`, and the same for
   everything else the change touched: for a shared change, the foundation's own turn
   (`--slug=<foundation>`), which re-captures its whole Capture through list.
6. **Sign off.** Each platform's Sign-off row names the after-phase run ids the turn record
   lists for it.

`--slug` takes a component slug, a page id or slug, or a foundation (its id, `glass-pane`, or
its name, `GlassPane`), read as `--only` is (above) with the foundations beside the canonical
names: a component's slug, a page's id, a foundation's id or name, then a page's slug where
nothing else has it. `--slug=calendar` is the Calendar component's turn and
`--slug=template-calendar` its page's; a foundation whose id a component or page also had
would go by its name, which nothing else can have. A foundation expands to its Capture
through list (see "Foundations"). The steps, in order:

| Step | What it does |
|---|---|
| web export | reuses `docs/dist` when the source fingerprint its entry bundle embeds (`extra.canvasBuild`, read off the bundle `docs/dist/index.html` loads) is this checkout's `sourceFingerprint()`; otherwise builds it (`cd docs && bun run build:web`) and reads it again, refusing it if it is still not this checkout's; `--no-build` refuses a missing or stale export instead |
| server | serves that export itself, in the turn's own process: the suite's static server (`e2e/support/static-server.ts`) with the production headers, over HTTPS on a free loopback port, so it never takes the suite's 4173 (which another checkout may be serving); stopped after the last web capture |
| web captures | `bun run audit:web -- --only=<components> --base=<the turn's server>` (the variants), `... --states --only=<the components the state table gives recipes>`, and `... --pages --only=<page ids>` for the pages among the slugs; audit:web's global setup checks the served fingerprint once more before its first cell |
| native build check | reads the installed Canvas Audit app off the booted simulator and emulator (`tools/audit/native/installed.ts`: on iOS the `.app` `simctl get_app_container` names, its `EXConstants.bundle/app.config` and `main.jsbundle`; on Android the base APK `pm path` names, pulled and read with `unzip`, `assets/app.config` and `assets/index.android.bundle`) and reuses it when it is a Release build of this checkout's source and native fingerprints; otherwise runs `bun run audit:native:build -- --platform=<the platforms that need it> --incremental`, reads the installed builds again and stops if one is still not this checkout's. The devices are shared by every checkout on the Mac (another worktree's audit build has the same app id), so the installed app is read, never a record a build left behind; the capture host's hello check still holds |
| native capture | `bun run audit:native -- --platform=ios,android --only=<every slug>` |
| analysis | `bun run audit:analyze -- --only=<every slug>`, then `audit:sheets` and `audit:index` with the same `--only` (never `--run`, so `SUMMARY.md` and `current.json` stay whole) |
| record | appends every run the steps made to `audit/turns/<id>.md` under the phase (below) |
| sheets | prints, per slug, `.audit/current/<slug>/index.md` and each sheet directory with its files |

| Flag | Effect |
|---|---|
| `--dry-run` | prints the whole plan (every command, the cells each capture plans, whether `docs/dist` is fresh now) and runs nothing: no build, no server, no capture, no record, and no device is read |
| `--web-only` | the web steps and the analysis, for when the devices are busy |
| `--native-only` | the native steps and the analysis |
| `--only-first=<n>` | a foundation only: keeps the first n slugs of its Capture through list (direct consumers first, in the docs' order), for a quick look at a large expansion; the turn record marks each of those runs as capped (`the first n of N`), and a sign-off still needs the whole list |
| `--no-build` | refuses a missing or stale export rather than build one |
| `--devices=ios:<udid>,android:<serial>` | passed to the native build and capture |
| `--workers=<n>` | passed to audit:web |

The exit status is 0 when every step ran and every run captured all it planned (a state not
reached is captured, as audit:web counts it: its reason is the record, and a finding), 1 when
a step failed, a capture took no cell at all, or a run left cells failed or missing (its runs
are still recorded), and 2 for a usage error or a refusal (an unknown slug, a stale export).
A refusal is read off the capture's run manifests as well as its command's exit status
(`captureVerdict` in `tools/audit/turn.ts`): a run its manifest records as `refused` stops the
turn with 2 however the command exited, so an export the tree outgrew between the turn's own
check and audit:web's (a file saved mid-turn) stops the turn before the states and the
analysis rather than recording empty runs and going on.

The **turn record**, `audit/turns/<id>.md` (`tools/audit/turn-record.ts`), is written by
`audit:turn` alone and committed with the turn. It has a `## before` and a `## after` table,
one row per run as it finished, appended and never rewritten, so a phase taken in two halves
(the web while the devices are busy, the devices later) keeps both, in order: the run id, its
kind (`variants`, `states`, `pages`, `native`), its platform, when it was recorded, its commit
(and `dirty` when the tree was), its status and cell counts as its manifest gives them, and
the slugs it captured. A run a later step's failure stopped the turn after is recorded all the
same. The runs themselves stay under `.audit/runs/` (local and gitignored); every checklist's
facts link the record, and `audit:checklists:check` holds every record to its shape (a row it
cannot read, a missing phase table, a record whose id names no checklist). A sidecar rather
than rows in the checklist: the checklists' hand-maintained sections are never written by a
tool, and the record is the machine's account of the captures, while the Sign-off rows stay
the reviewer's.

Measured on 2026-10-10 on this Mac, `--web-only` (the devices were busy with the S1 sweep),
6 workers: `--slug=button --phase=before` found no export, built it (about 2 minutes),
served it on its own port and captured 270 of 270 variant cells (1 min 12 s) and 24 of 24
state cells (11 s), then analyzed, drew 197 sheets and indexed, and recorded its two runs.
`--slug=glass-pane --phase=before --only-first=3` reused that export (fresh) and captured the
first 3 of GlassPane's 73 Capture through slugs (chip, emblem, autocomplete): 324 of 324
variant cells (1 min 22 s) and 90 state cells of chip's and autocomplete's recipes (33 s; 84
reached and 6 not, Autocomplete's press on its chevron, whose pressed look is its hover's),
257 sheets, both runs recorded as capped. Those runs were a proof of the command, taken in a
worktree, so their records were not kept; each component's own turn starts its record.

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
run unless `--allow-stale`. So does a global setup that stopped before it recorded the server at
all (nothing answering at `--base`, a diagnostics page that never loads): whose source that
server shows is unknown, so no cell can be taken as this checkout's. A refused run is `refused`
in its manifest, with the reason under `refusal`, and `audit:web` exits 2
(`webRunOutcome` in `tools/audit/web-capture.ts`).

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
  clipping and truncation. For the analysis that reads a text's contrast off the photograph,
  each text also records the opacity that dims its ink alone (`ownOpacity`: the opacity
  groups its backdrop is not in) and, when it shares dimming groups with its backdrop (a
  pressed control at 0.9 dims its fill and its label together), their opacity and the
  outermost one's box (`shared`), and each row records where its boxes are measured from
  in the viewport (`origin`). A form control's own text is one of them, marked `field`: a text
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

### Interaction states

`bun run audit:web -- --states` captures what a resting example cannot show: every
component in the interaction registry (`tools/interactions/registry.ts`) hovered, focused,
pressed, opened, invalid and disabled, as far as it has those states. The recipes are one
table, `e2e/support/state-recipes.ts`: per component either the recipes for the states it
has, each naming the example it is applied to, or `static: true` with the reason it has
none (a layout primitive, a meter, a chart whose source takes no input), and, beside
either, `exempt` for a state its source gives it that no capture is due for, with a claim
the unit test checks.

What a component has is read from its own source, not taken from the table's word for it.
`tools/audit/interaction-signals.ts` reads every module of the component's directory (the
shared shell, the platform entries, the skins and the parts) and the shared chart modules
they render, never run, for the inputs that have a state: a press handler (`onPress`,
`onPressIn`, `onLongPress`) or a raw responder (a ScrubSurface, a PanResponder) gives a
pressed state; `onHoverIn`, `onPointerEnter` or the hover primitive (`useHover`,
`src/style/hover.tsx`) a hover state; a TextInput, a link (`href`, a `link` role) or any
other tab stop react-native-web makes a focus state (every Pressable, which it gives a tab
index of 0 unless the source takes it out with `focusable={false}`, `tabIndex={-1}` or
`disabled`; a button, checkbox, radio, switch or textbox role; `focusable` or tab index 0
on any primitive); an overlay it renders (React Native's Modal, the style layer's
AnchoredOverlay or Portal), or another kit component whose source renders one and to which
it hands the open state (FilterPanel's and Sidebar's Drawer, and AvatarMenu's Dropdown, a
part its platform entries inject, known by the component its parameter's type names), an
open state, each overlay named by the function that renders it; and a function
taking `pressed`, `hovered` or `focused` (a skin, a Pressable's style callback) the state
it names; and `disabled`, `aria-disabled` or an `accessibilityState`'s `disabled` given a
value that can be true, or `disabled` handed to another kit component (AlertDialog's confirm
Button), a disabled state, with the ways its value is true (`disabledBy`: the props it is
true with, `disabled` or `withInput` through `const confirmGated = !!withInput && ...`, and
the keys of the item data it reads, `item.disabled`; `disabled || loading` is true either
way, and a value the reader cannot follow, a stepper's minus at its minimum, is the
component disabling it by itself) and the overlay it renders inside (`within`: the overlay a
JSX parent opens, through a constant used inside one, `actionRows`, and through a local
component that renders its children inside one, AlertDialog's `Present`). A disabled control
inside an overlay the same prop keeps closed (a Select's option rows, whose list
`!disabled && ...` never opens) is never on the page and gives nothing. Props are read wherever the element gets them: on its tag, or spread onto it from
a value the reader can follow (an object literal through constants, conditionals, `&&`,
`??`, member reads, a local or shared helper's return, `useMemo`, or a style-layer hook's
own return, as the Calendar's `{...hoverProps}`, Tooltip's `{...disclosure}`, the hover
primitive's `{...target}` and the scroll regions' `{...scrollport}`); a spread it cannot
follow (a parameter, another component's export) gives nothing. A press, a focus or a hover
handed to another kit component (Divider's Button, FilterPanel's Clear, Dropdown's default
trigger, DescriptionList's Update link) is that component's; `disabled` handed to one is the
component's disabled control, for that state alone.

Each signal on an element names it (`Control`): its tag, the function it is rendered in, the
component's own functions whose tag it is the content of (Sidebar's rows sit in
`SidebarRowFrame`, the hover target that washes them), and the ARIA roles the page gives it,
as react-native-web maps them (`adjustable` is `slider`, a TextInput is a `textbox` unless
given another role, a role given only under a condition may be none). It is placed where it
renders (`within`): on the component's own surface, inside an overlay it opens, or both (a
constant used in both, FilterPanel's `panel`, on the panel and in the drawer it becomes at a
phone's width). Another kit component given its open state holds the content between its
tags inside its overlay only when its own source renders `children` there (a Drawer's
content is in the drawer; a Dropdown's is its trigger, so AvatarMenu's pill is on the
surface). A component the component's own factory builds and renders as a tag is read where
it is used, as a local component is: Sidebar's `const SidebarDrillDown =
createSidebarDrillDown(skin, Badge)` renders inside the Drawer the Sidebar opens, so the
drill-down's rows are the drawer's (gated by `responsive`), not the rail's surface. A factory
an entry calls makes a component of its own (AvatarGroup's Avatars), read whole as one.

Each signal also says which platform builds render it (`builds`). A component is built once
per platform by its entries (`dialog.tsx`, `dialog.ios.tsx`, `dialog.android.tsx`, each
calling the shell's factory with its own skin and parts), and a shell renders different
controls per skin: Dialog's footer is the iOS build's capsules under `skin.footerKind ===
"capsules"`, the Android build's text buttons under `skin.textButton != null`, and the web
build's kit Buttons otherwise; AlertDialog's the same under `skin.actionLayout`; DataTable's
cell editor and scroller differ by `skin.liquidTextEntry` and `skin.collapsesToPrimaryColumn`.
The conditions around a signal that read a factory's parameters (a ternary, `&&`, `||`, an
if, an early return, through a constant used where it is placed) are evaluated with each
entry's arguments, the skin objects read from their modules with the static evaluator
(`tools/audit/static-eval.ts`, a build's skin spreading another's included), and through a
factory a factory calls (`createSidebarDrillDown(skin, Badge)` takes each entry's skin through
`createSidebar`). A build whose arguments make one of them go the other way does not render
the signal; a condition the evaluator cannot read keeps every build, as does one in a family's
shared module, whose skin is each caller's. The reader also reads what decides whether a control is there and what it takes:
a local constant's value (`const onPress = onPressItem ? ... : undefined` gates a GridList
gallery tile on `onPressItem`), `children` given between the tags, the props every read of a
look's input is guarded by (`onEventPress && pressed ? dim : null`), a render helper's
argument at each call written as a literal (the Calendar's `eventLayer(..., false)` gives
the blocks in its day peek no hover), a prop given on one side of a condition only, which
does not take an element out of the tab order (Video's play overlay), a `Platform.select`
tab index read for the web (Autocomplete's rows, `-1` there, are no tab stops), and a
TextInput's `editable`, which is how React Native's text field is disabled.
A signal can be gated: it renders only when the component is given a prop (`onItemPress`
makes a Feeds row a button), read from the if, ternary, `&&` or early return around it and
followed through the local and shared components it is reached through (a Steps circle is
pressable when it is given `onPress`, which Steps gives it only with `onStepPress`).
`tools/audit/state-coverage.ts` then holds the table to the source: every state a
component's source gives it has a recipe, or an exemption whose claim holds, checked against
the source and the page. A hover, a focus and a press are answered place by place, as the
disabled state is (below): on the component's own surface and inside each overlay its source
renders them in, since a menu's rows are on the page only once the menu opens and no variant
cell photographs them. A recipe answers the place it is applied in, and only through a
control of the component's own there: it names its control (`StateRecipe.control`, the ARIA
role its target is found by, and the function that renders it where the role does not single
it out; a menu row is a `menuitem`, a chart's scrub surface has none), and that control must
be one the source renders in that place, in the recipe's example (which passes every prop
that renders it), with that role, and the function that renders it, or one it sits in, must
take the state there. A recipe on a control another kit component renders for the component
answers nothing and is an error, with the component's own controls in that place listed, and
the place it left is unanswered. The capture holds the element the state lands on to the
same role (`controlMismatch` in `e2e/support/state-recipes.ts`): the element under the
hovering pointer, the one the Tab key focused, the one held down, the one the example
disables; a different one is a state not reached.

A place is answered row by row. A recipe is applied on rows of the docs' three-up
(`StateRecipe.rows`), and each row shows one build (`docsRowsOf`: the web row the web build,
the iOS and Android rows the build the docs registry injects there, or the web build where it
injects none, as on Toast's iOS row; Sidebar's page shows the web row alone). A recipe
answers its place on each row it is applied on, through a control of the component's own on
that row: the same role and name can be the component's own control on one row and a kit
child on another, so Dialog's and AlertDialog's Cancel, a kit Button on the web row, answers
nothing there, and their focus is captured on the iOS and Android rows, where the Cancel is
the component's own capsule or text button, and their press on the iOS row. A signal is
answered only where a recipe answers its place on a row that renders it. A signal no row of
the page renders (a build whose row the page leaves out) is never on the web runner's page:
the checklist records it as judged on devices, never as a recipe's, and a recipe applied on a
row the page does not show is an error.

Nor is a state whose only feedback on a row is one only a device draws. The web runner renders
every row through react-native-web, which drops `android_ripple`, so a control that shows a
held press with the ripple alone shows the runner nothing. The reader names that feedback on
the control (`Control.deviceOnly`, from `DEVICE_FEEDBACK` in
`tools/audit/interaction-signals.ts`), per build: the ripple's value is evaluated with each
entry's skin and must be known not to be empty, and nothing else the control is given may
repaint a held press on the web (a style function reading `pressed`, or `focused`, which a
pointer press sets there, where that build reaches the read; `onPressIn`, `onLongPress` or a
raw responder), nor may a look or responder of the component's on no element. Dialog's and
AlertDialog's Android text buttons are such controls; their iOS capsules are given no ripple
and dim under a style function reading `pressed` behind the skin's pressed opacity
(`skin.capsulePressedOpacity`, `skin.pressedOpacity`), which only the iOS skin sets.
`tools/audit/state-coverage.ts` answers such a signal by the devices (`devices`, with the
`feedback`) when every row that renders it is one where that is all its control shows, and
refuses a recipe applied on such a row on such a control (it would set up a state the web
cannot show), so their press recipes are applied on the iOS row alone. The ripple counts only
on the Android row, the row that stands for the devices that draw it: on the web and iOS rows a
press with a ripple and nothing else shows nothing on those platforms either, and like a press
with no feedback at all it is the runner's to capture, its cell, not reached, the finding.

| Claim | Holds when |
|---|---|
| `unpassed` (props) | every signal of the state is gated by one of the props, and no rail example renders one, none passing every prop it is gated by (Feeds' `onItemPress`, Steps' `onStepPress`, Typography's `href` and `onPress`, Avatar's `onPress`, the Calendar's `onEventPress`, GridList's `onPressItem`: its gallery tiles need `gallery` too, and its Gallery and Tappable examples pass one each) |
| `dismissLayers` | every signal of the state is a press on an element the source keeps from assistive technology, with no pressed look, whose handler is empty or closes, and the component has an open recipe (Drawer's scrim and panel) |

A state is answered by a recipe of its own, or by another state's recipe whose capture
shows it (`alsoAnswers`): an opening a resting pointer makes is its trigger's hover, so
Tooltip's open recipe answers the hover its triggers' `{...disclosure}` gives, and the
Calendar's hover recipe, which floats the event's card, answers that card's opening. A
component whose source renders more than one overlay owes each its own recipe: every recipe
that opens one names it (`opens`, the function the source renders it in, the Calendar's
`hoverCard` and `dayPeekOverlay`), an overlay no recipe names is unanswered, and a name the
source no longer renders fails. An exemption for a state the source does not give, or beside
a recipe for the same state, fails too. A state a component shows on its own surface and
inside the overlay the same example opens has a recipe in each place, the second named
`<state>-<variant>-inside` (Command's focus on its Search trigger, and on a row of the
palette the trigger opens).

The disabled state is the examples': a control is disabled where an example asks for it, by
passing what its source disables it with (a prop written on a tag, or a key written in an
item, `{ label: "Archive", disabled: true }`, read with the TypeScript parser, neither given
`false`). It is answered place by place: on the component's own surface, and inside each
overlay it opens, since a control in an overlay is on the page only once the overlay opens
and no variant cell photographs it. A place where a rail example asks for a disabled control
needs a disabled recipe there: one applied inside an overlay (`inOverlay`) opens it first,
and names it (`opens`) when the source renders more than one. A place no example asks for
needs nothing, nor does a control the component disables by itself, which every capture of
its place already shows; there is no exemption for disabled. A state a component shows in
more than one place has a recipe for each (Dropdown: its Disabled trigger, and the Archive
item inside the menu its Disabled item example opens), and their cells are named for their
examples. The invalid state is not read from the source: its recipes are the examples that
show an error, and Textarea's typing past its soft cap (below).
`tools/audit/state-recipes.test.ts` runs it over every component (and fails on the table as
it stood before the charts got their recipes: Chart, AreaChart and Histogram scrub, the
Heatmap's days take a resting pointer and a press; on the Calendar marked static, for its
hover, focus, pressed and open states; on Dialog, AlertDialog, ActionSheet and Toast
without the focus recipes their own tab stops need; on ActionSheet's Disabled action,
RowMenu's and Dropdown's Disabled item and AlertDialog's Body field, whose disabled
controls are inside the overlay each opens, without the disabled recipes that open it; on
FilterPanel's focus on its header's Clear, Dropdown's focus and press on its default trigger,
DescriptionList's focus and press on its Update link and GeoMap's focus on Zoom in, each a
kit Button, so the option rows, the custom trigger, the menu rows, the inline-edit field and
the map that are theirs were never captured; on Dropdown's and FilterPanel's focus on one
place alone, the menu and the drawer left unanswered; on Dialog's and AlertDialog's focus
and press on the web row's Cancel, a kit Button, with their own capsules and text buttons on
the iOS and Android rows never captured, and AlertDialog's Body field confirm on those rows
too; on Dialog's and AlertDialog's press on the Android row, whose text buttons press with
`android_ripple` alone; on DataTable's focus on the web row alone, its native cell editor
left; and on Sidebar's rail recipes alone, its drill-down's rows inside the drawer left
unanswered),
checks the reader on the kit and on
fixtures of every gate form and every spread form, tab stop and overlay, and also fails on a
registry entry with neither recipes nor a reason, a recipe on an example its page does not
have, a hover recipe where the source gives no hover, an overlay its source opens or one of
`overlay-recipes.ts` (or Tooltip's in-row bubble, which no overlay primitive carries) without
an open recipe, and open
rows that differ from the docs' platform-skin registry (Sidebar's page shows one preview,
the web build, so it opens from the web row alone). Each checklist's facts block carries the
result as its "Interaction states" row. The facts are generated from the source alone (in CI,
with no capture), so the row says what the web runner sets up, never what a capture reached;
a run's cells and the reviewer's index say that. It gives the recipes (`recipes:`: the
example, whether it is applied inside the overlay it opens, the rows, the widths, the states a
capture also shows and the overlay it opens when there are several), any static or exempt
state with its reason and whether its claim holds, where the source disables controls no rail
example asks for, and, under `not reachable on the web:`, each state the source says the web
runner can never show, with why: one its source gives only in a build no row of the page
renders, and one whose only feedback on a row is `android_ripple` (Dialog's and AlertDialog's
press on the Android row), both judged on devices; and a recipe whose state its source never
announces on the web, a field disabled only through a TextInput's `editable`, which
react-native-web renders read-only (Input's and Textarea's Disabled, below). That recipe
stays: its cell records the finding.

Each recipe applies the state through the input a person uses, verifies it from the page's
structure, and releases it:

| State | Applied | Reached when | Photograph |
|---|---|---|---|
| hover | the pointer moves onto the control and rests (Dropdown, RowMenu and Command: on a row, with the menu or palette open; Command: also on a row of its Inline example; AvatarMenu: on its pill, inside the Dropdown trigger it is handed as content; the Heatmap: on a calendar day; the Calendar: on the Week example's Design review block, which floats its detail card; Sidebar: on a rail row, and on a drill-down row inside the drawer its hamburger opens) | the control, its contents or its wrappers up to the row changed transform, box shadow or background (the lift and the wash `src/style/hover.tsx` applies; a Command row's active highlight); for the Heatmap, the readout it shows; for the Calendar, the card the resting pointer opened, found as an opening is; every watched property that changed is the evidence | the web row, desktop (the viewport inside an overlay, or for a card the pointer floats over the window; Sidebar's drawer at a phone's and a tablet's width, where it is one) |
| focus | Tab, from the tab stop before the control (Dialog and AlertDialog: their own Cancel inside the opened overlay, a capsule on the iOS row and a text button on the Android row, the web row's being a kit Button; ActionSheet: inside the opened overlay; Select, PhoneInput, RowMenu, ButtonGroup's split menu, Command's palette, the Calendar's day peek and the provider's toast: on a row or a button inside the opened overlay; Dropdown: ArrowDown from the first row its menu focuses as it opens, and its Custom trigger example's button; FilterPanel: an option row, on the panel and inside its drawer at a phone's width; Sidebar: a rail row, and a drill-down row inside its drawer at a phone's and a tablet's width; DataTable: its sortable header, on every row, its native cell editor being on the iOS and Android rows'; DescriptionList: its inline-edit field, once its Update link swaps it in; Radio, Listbox, ButtonGroup, TabBar and Tabs: the stop inside the group; Toast: the With an action example's Undo; the Heatmap: its calendar's scroller, at a phone's width, the only width the year overflows it) | focus is on or inside the control, the focused element has the control's role, and it matches `:focus-visible`; the node whose edges the arriving focus changed is the ring, and `ringShows` (`e2e/support/focus-ring.ts`) looks for it in the pixels on every side, in the colour it paints at | the web row, desktop (the viewport inside an overlay); Dialog and AlertDialog on the iOS and Android rows, DataTable on every row; a drawer's rows at the widths it is one |
| pressed | the pointer goes down on the hovered control and stays down (a Slider on its thumb; Dialog and AlertDialog on their own Cancel inside the opened overlay, on the iOS row, the Android row's text button pressing with `android_ripple` alone, which react-native-web does not draw (judged on devices); ActionSheet, Autocomplete, Select, PhoneInput, Dropdown, RowMenu, ButtonGroup's split menu, Command's palette and the provider's toast on a control inside the opened overlay; FilterPanel on an option row inside its drawer as well; Sidebar on a rail row, and on a drill-down row inside its drawer) | the element held down has the control's role, and holding it changed a watched style against the hovered control (a press that looks like the hover is not reached, and says so) | the web row, desktop (the viewport inside an overlay); Dialog and AlertDialog on the iOS row; a drawer's rows at the widths it is one |
| pressed, to inspect | a chart that inspects under a press is pressed on one datum, found from what it draws (above an axis label, a tile's or a stage's label, a mark): held down on a scrub surface, a click on a Pressable hit layer | the chart shows text it did not show with the pointer away (the value flag, a readout) or repaints its marks (the others dim); with the recipe's expected texts, those (`Q2`, `Revenue`, `70`) | the web row, desktop |
| open | the overlay recipes' own clicks (`OVERLAY_RECIPES`, `PHONE_INPUT_RECIPE`, `TOAST_RECIPE`), a hover on Tooltip's On hover example, a click on the AvatarMenu pill, ButtonGroup's split chevron, the Calendar's Day peek 24th, FilterPanel's Filters (n) trigger and the Sidebar example's hamburger, from the web row and from every row whose platform build the docs registry injects (`docs/src/core/platform-skins.ts`; Toast's iOS row is the web build; Sidebar's page shows the web row alone) | the opening added exactly the recipe's node (a dialog, a menu, a listbox, a speaking live region, the tooltip's bubble), or for a card with no role (the Calendar's day peek and hover card) exactly one new subtree holding the text it shows, where the Playground's overlays paint; the evidence says where it painted, whether it runs edge to edge on its frame's bottom (a sheet), whether it is in view and whether the trigger reports `aria-expanded="true"` | the viewport at the cell's own size, all three widths (a drawer a component becomes at and below a breakpoint: those widths, FilterPanel's at a phone's, Sidebar's at a phone's and a tablet's) |
| invalid | the example that shows the error; Textarea typed past its soft cap | the field carries `aria-invalid="true"`; the error text it is described by is the evidence | the web row, desktop |
| disabled | the example that disables the control (ActionSheet's Disabled action, RowMenu's and Dropdown's Disabled item and AlertDialog's Body field: inside the overlay the example's trigger opens) | the control has its role and carries `aria-disabled="true"` or a native `disabled`; one still a tab stop is flagged `disabled-tab-stop` | the web row, desktop (the viewport inside an overlay); AlertDialog's confirm on every row, the kit Button it disables on the web's and its own capsule and text button on the iOS and Android rows |

The release ends the state the way a person would and is measured, not assumed. A press ends
by moving off before the button comes up, which cancels a press on every platform, or, on a
slider's thumb or a drag handle that a move would drag, by coming up where it went down.
The measurement is of the element pressed, pinned when the press began, so a press that
takes its control out of the page (a dialog's Cancel) is read, not waited for. After a
move-off no click may reach the control as the button comes up: react-native-web runs a
Pressable's `onPress` from the native click, so a click there is the press firing, even when
its handler changes nothing to see (the docs' Save changes). Then, with the pointer away
again, the control must still be in the page, and the row's accessibility tree (or the
overlay's), the page's address, and the control's computed look and its pixels must be what
they were before the press, or the cell is flagged `press-not-cancelled` with what differs
(and where focus went), whether the control announces a state or not. Text the drag off the
control selected on the way is recorded and cleared before that comparison, since the page
selected it, not the press; when the selection takes in the control's own label the cell is
flagged `press-selects-label` (Button and Chip keep their labels out of a selection; the
sweep below lists the controls that do not). An inspection is
cleared by a second press on the same datum (the charts' documented toggle) or by the
pointer moving off a heatmap day, and the row must be back to how it was
(`inspection-not-cleared`). An overlay closes on Escape and must be gone 3 s later
(`overlay-not-closed`); one a press inside it already closed (Dialog's Cancel) is recorded
as closed before its close. The release runs for a state not reached as well, so a press with no
look of its own that still fires is caught.

Every state is captured in all six looks and surfaces. A state its recipe cannot confirm is
recorded as `state-not-reached` with the reason in the record and in probe.json, and is
never photographed: a missing state is a finding, not a picture of the resting control. A
reached state is probed as a variant cell is (the row, and the panel an opening added or the
overlay a state applied inside one is in, judged by the row's platform floors), and adds its
own flags: `focus-ring-missing` (nothing drew a
new edge), `focus-ring-hidden` (drawn, but not seen on every side), `focus-ring-colour` (not
the look's `ring`), `expanded-not-announced`, `error-not-described`, `disabled-tab-stop`,
`hover-unstable` (a tooltip whose bubble, opening in flow above its trigger, pushes the
trigger out from under the resting pointer: the recipe follows the pointer to the trigger so
the open bubble can be photographed, and records that it had to), and the release's
`press-not-cancelled`, `press-selects-label`, `inspection-not-cleared` and
`overlay-not-closed`. Every flag is in
the cell's line of `cells.jsonl` and counted in the run's summary.
An overlay the Playground contains in its row (Dialog, AlertDialog, Toast, Tooltip) is
framed against that row; one placed against the window (an anchored menu, a Drawer, an
ActionSheet) against the viewport. A row's photograph keeps the margin the row's paint needs
while the state holds: before the shot, `probePaint` (`e2e/support/audit-probes.ts`) reads
every shadow, outline and transform-moved box of the row and of everything in it, each cut to
the overflow clips inside the row that reach it (an absolutely placed element escapes the
clips below its containing block), and `paintedMargin` (`tools/audit/web-capture.ts`) takes,
side by side, how far past the row's box the furthest of them reaches: an outer shadow's
offset, spread and blur, scaled with its element; an outline's width past its offset; a box a
hover lift moved. A row whose paint stays inside it has no margin. The viewport is not grown
for a state (that would move what the pointer rests on), so a side it cuts is recorded in the
shot's `cut`, beside the `margin` and what set each side (`marginBy`).

A state cell is `web-states/<slug>/<name>.<row>/<width>.<look>.<surface>/` with `state.png`
(a reached state) and `probe.json` (the recipe, the evidence, the release and its flags, and
for a reached state the probe: the row and the panel the state opened, each with its
`origin`, and the shot's `clip`, so the analysis finds every text in `state.png`). A panel
drawn inside its row (Dialog, AlertDialog, Toast, the Tooltip bubble) is read with the row,
so its texts and targets count once; its own entry (`inRow: true`) keeps where it is, its
tree and its material. The example a state is applied to is on its record (`variant`,
`label`); it is in the path only for a state the component has several recipes of
(`disabled-disabledtrigger`, `disabled-disableditem`; `focus-default-inside` for Command's
palette row beside `focus-default`, its Search trigger). A cell of a recipe the table no
longer has (one named for its state before the state gained a second recipe, as Dropdown's
`focus` and `pressed` were before their Custom trigger and menu row recipes) is left out of
the index and the sheets, with a warning.

Two decisions differ from the plan's 1d:

- **Invalid is shown, not typed, for fields that do not validate on their own.** The plan
  says invalid "types bad input and verifies `aria-invalid`". Only Textarea judges its own
  input (past its soft character cap it marks itself invalid), so only its recipe types.
  Input, Field, Form and PhoneInput take their error from the app (an `error` prop or
  message) and never validate what is typed; typing into them would leave them valid and
  photograph nothing, so their recipes use the rail example that shows the error, which is
  the state the kit actually renders. A field that grows validation of its own gets a typing
  recipe.
- **A chart's press-to-inspect is its pressed state.** The plan's states are hover, focus,
  pressed, open, invalid and disabled; a chart has no pressed look of its own, so its pressed
  cell is the inspection its press opens (the value flag), verified by what it shows.

Measured on 2026-10-10 against a static export on this Mac, 6 workers (run
`20261010-004911-web-45aebec`, a clean tree): every state of every component is 1,950 cells
(70 components with recipes, 197 recipes, 325 cells per look and surface), 9 min 35 s and
328.1 MB, 1.8 s a cell; none failed and 66 were not reached, every one a state the kit does
not show on the web or a finding: a press with no feedback of its own on Autocomplete's
chevron, Command's trigger and a row of its palette (its pressed look is its hover look),
Dropdown's custom trigger (the button the AvatarMenu pill sits in), FilterPanel's option
rows on the panel and in its drawer and Video's play button in every look, and on Switch and
ButtonGroup under glass; the Heatmap's press on a calendar day in every look (the resting
pointer has already opened the day's readout, and the click toggles it off, so a mouse can
never pin it); and Input's and Textarea's Disabled examples (below). The focus on a row
inside an open menu or list (Dropdown's, Select's, PhoneInput's, RowMenu's, ButtonGroup's
split menu, Command's palette) is reached in every look and flagged `focus-ring-hidden`: the
list's clip cuts the row's outline at its sides, top and bottom showing; DescriptionList's
inline-edit field takes focus with nothing new drawn (`focus-ring-missing`: its
ring-coloured underline is there before focus too); GeoMap's map draws its ring off the
look's `ring` colour (`focus-ring-colour`). The releases flagged `press-selects-label` on
Pressable, Autocomplete, Breadcrumb, ButtonGroup, Checkbox, Listbox, Radio, Switch,
FilterPanel, Navbars, TabBar and Tabs in every look, `press-not-cancelled` on Slider in every
look (its thumb keeps the pressed ring after a pointer press, because the ring is also its
focus look and the press leaves it focused; under glass the ring is a 4 px transparent
border that only shrinks the knob) and on Command's palette row (the press focuses the row,
and the hover's active highlight stays on it after the pointer leaves). No inspection or
overlay failed to clear. The 24 cells of the disabled controls inside an overlay
(ActionSheet's Save As…, RowMenu's Clear column, Dropdown's Archive and AlertDialog's
Delete, every look) were all reached, each `aria-disabled="true"` with a tab index of -1
(`disabled-tab-stop` on none), its overlay probed beside the row, so the analysis reads the
disabled label with the rest of the overlay (each exempt from the contrast floor as WCAG
1.4.3's inactive control). The sweeps before: 1,890 cells (run
`20261009-232215-web-7052eef`, 9 min 18 s and 295.7 MB, 54 not reached), before every
recipe was held to a control of its component's own and before a hover, a focus and a press
were answered in each place they render (FilterPanel's focus was then its header's Clear
and Dropdown's its default trigger, both kit Buttons, and DescriptionList's focus and press
its Update link, so the rows, the custom trigger and the field were never captured); 1,692
cells (run `20261009-162815-web-93f62e9`, 9 min 10 s and 246.6 MB, the same 54 not reached),
before every overlay a component opens had its own recipe and before the disabled controls
inside an overlay; and the first sweep of 1d, before the press-to-inspect, overlay and
Slider recipes and the release measurement, 1,530 cells, 7 min 09 s and 228.7 MB, 48 not
reached.

The rows came after that sweep: Dialog's and AlertDialog's focus and press moved to the iOS
and Android rows, AlertDialog's Body field confirm and DataTable's focus to every row, and
Sidebar gained its drawer's hover, focus and press at a phone's and a tablet's width, so the
figures above count the table before them. Their own capture (run
`20261010-014451-web-02e7af5`, a clean tree, `--only=dialog,alert-dialog,sidebar,data-table`;
its id names a work-in-progress commit since folded into the two that made the change, whose
recipes, reader and capture code it ran unchanged) is 264 cells in 1 min 18 s and 55.5 MB: none failed, and the 12 not reached are the Android
rows' Cancel press on Dialog and AlertDialog in every look, a text button whose press is
`android_ripple`, which react-native-web does not draw (the iOS rows' capsules dim to their
skin's pressed opacity). The iOS and Android rows' Cancel takes the look's ring on every side,
and the drawer's Inbox row its ring, its pressed fill and its hover wash at both widths. Those
12 cells are no longer planned: the coverage now reads that a ripple is all those text buttons
show of a press, records their press as judged on devices, and refuses a recipe for it on the
Android row, so Dialog's and AlertDialog's press is applied on the iOS row alone (Dialog plans
72 cells, not 78).

Input's and Textarea's Disabled examples are an accessibility finding, not a state the kit
leaves out: a disabled field is dimmed and made read-only (`src/atoms/input/input.shared.tsx`
sets `editable: !disabled && !readOnly` at line 318 and the disabled opacity at lines 393 and
490; `src/atoms/textarea/textarea.shared.tsx` sets `editable: !disabled` at line 198), but it
carries neither `aria-disabled` nor a native `disabled`, so assistive technology meets a
read-only field, not a disabled one. Their disabled cells stay `state-not-reached` (the
recipe checks the announced state), and each cell's evidence records that the field is
read-only. The coverage reads the same from the source (the reader marks a disabled signal
given by a TextInput's `editable` as `readOnly`, and a disabled recipe whose controls carry
nothing else that disables them is `unreachable`), so each checklist lists that recipe under
`not reachable on the web:` with the reason. A field also handed `aria-disabled` (Stepper's,
through its accessibility helper) is announced, and not listed.

### Pages

`bun run audit:web -- --pages` captures the 24 pattern and template pages at every width, look
and surface. A cell opens the page, checks that the sections it marks are the inventory's in
order (a renamed, added or dropped section fails the cell), photographs the first screen at
the cell's viewport (`viewport.png`), then fits each section into a grown viewport, photographs
it with the margin its own paint needs, read as a state's row's is (`section.<key>.png`; a
card's drop shadow at the section's edge, 40 px below a resting card and 60 px below a raised
one, is not cropped; the margin stays inside the part of the page no top bar or floating tab
bar covers, the viewport grows for it and the margin is read again until the band holds it,
and a side still cut where the page itself ends is recorded in the section's `cut`) and
probes it as a variant's row is; probe.json adds the document's, the page scroller's and each
section's overflow, axe over the sections where the axe policy says, each section's clip,
`margin`, `marginBy` and `origin` (so the analysis finds every text in its section's
photograph), and how long each step of the cell took (`ms`). A page cell is
`web-pages/<kind>-<slug>/<width>.<look>.<surface>/`.

Every page is 432 cells (24 pages, 67 sections): 6 min 35 s and 284.8 MB on the same
machine, 3 s a cell at the median, before the loop fix below.

With the margin read from the paint (run `20261009-220505-web-05cafc4`, a rebuilt export,
6 workers): 432 cells in 4 min 47 s and 301.0 MB, 3.9 s a cell at the median. Every one of
the 1,206 section photographs takes 20 px to each side and 40 px below from the resting
card's shade (`0 20px 44px -24px`; no pattern or template rests a raised card), and none is
cut. The fixed 12 px margin it replaces stopped a section's photograph while the shade under
its card was still 9 luminance levels darker than the page beside it (template-pricing's Plan
tiers, blush, desktop); now the column under the card reaches the page's own level (243
against 243 and 244) before the edge. The Card page's Raised example, read the same way,
needs 30 px to each side and 60 px below, and its Pressable example under the pointer 2 px
above for the lift.

`pattern-loading` cells took up to 146 s each while its six look and surface tests ran at
once (3.3 s for the same cell alone). The step timings put almost all of it in fitting and
photographing the sections, and the cause was the capture's own: every audit browser is
launched as the suite's are, with `--disable-frame-rate-limit` (`CHROMIUM_ARGS` in
`playwright.config.ts`, a mitigation for a Chromium frame-pipeline hang on CI), and the
page's Spinner is an infinite CSS animation (essential motion, which reduced motion leaves
running), so the browser drew frames without limit: 2.3 CPU seconds a second for that one
page at rest, against 0.03 with the spinner paused or without the switch. Six such pages
starved the machine. Nothing the capture does needs a loop to turn (every photograph
disables animations, and no recipe reads one), so every audit page now holds each infinite
animation still from the moment it starts (`holdLoops`, `e2e/audit/cell.ts`), finite ones
untouched. The full `pattern-loading` sweep (18 cells, 6 workers) went from 4 min 54 s wall,
97.2 s a cell on average and 146.5 s at most, to 18 s, 5.1 s and 5.5 s, with every one of its
90 photographs byte for byte the same.

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

  The black ring was a kit defect, not a capture artifact, and the pane fix below removes
  its cause in source; no Android capture has confirmed it yet (see the pending re-run at
  the end of this note). Chip read its paint from `useMaterialTheme`, which demotes the surface to solid, but its
  `GlassPane` read `useTheme()`, still saw glass, and mounted a `GlassSurface` that
  resolved solid and painted the pane's own shape as a plain view. That shape is the
  skin's `base` (`androidBase` in `src/atoms/chip/chip.styles.ts`), which carries
  `borderWidth: 1` but no `borderColor` (the colour is set on the chip's `chrome` from its
  tone), so Android drew the default black border; Badge and Kbd shapes have the same
  form, and a shape that names its colour drew a second hairline one border-width in.
  Button never showed it because it mounts its pane only on its resolved `puck` flag
  (`isGlass` of the theme `useMaterialTheme` returned), not because of the shape it
  passes. A GlassPane now reads the same resolution as its host
  (`useMaterialResolution` in `src/style/glass-surface/use-material-theme.ts`) and renders
  nothing where it resolves solid. `test/material-solid-fallback.test.tsx` holds every
  pane host to the solid markup wherever requested glass cannot render (the web stand-in:
  a browser without a backdrop filter), and `test/material-resolution.test.tsx` renders a
  pane host with Android's capabilities: no pane while no capture target is ready, the
  frost once one is.

  **Android's glass column equals solid outside overlays, by design.** An in-page Android
  surface has no capture plane it may safely sample, so with glass requested it resolves
  to its complete solid skin (`missing-target`). After the pane fix, every Android cell of
  a component in the page is expected to match its solid cell byte for byte; a difference
  there is a defect to file, not the material. Android frost appears only on a surface in
  an overlay outlet with a capture target or in a Modal sheet that bridges the window
  target (Popover, the option menus, Drawer, ActionSheet), and only once a capture opens
  one.

  **Pending: the Android re-capture.** The expectation above rests on source and unit
  tests; the cells measured above predate the fix. It is confirmed only by
  `bun run audit:native -- --platform=android --only=chip,badge,kbd,switch,input,card,alert,checkbox,radio,steps --dev`
  and the glass-versus-solid comparison above, which have not been run since: until they
  are, the black ring and the doubled hairlines stay open on Android.
- **Pages.** `pattern-glass` and `template-signin` in dark glass: iOS 2,350 points of the
  sign-in page in 4 segments, Android 2,075 dp in 3, stitched without a seam; 8 s a page on
  iOS and 25 s on Android (each segment is two grabs).
- **Stability.** Every Button and Switch card held still between the first two grabs (the
  largest difference 0.06 on iOS and 0 on Android, against the 0.1 threshold), so no cell
  needed a third grab and none was marked unstable.

## Analysis, contact sheets and the index

Three commands turn the runs into what a reviewer reads, a fourth keeps the disk in check,
and a fifth measures the analysis' contrast against the DOM. All of them read the runs
through one module (`tools/audit/runs.ts`), so they agree on what the **current capture** of
a cell is: the newest one across every run under `.audit/runs/`, by when its record says it
finished (`at`, which the web cells and the native host both write; a native record older
than that stamp takes its run's start), then its run's start, then its line in
`cells.jsonl`. A partial re-capture (`--only`, `--variants`, `--states`, `--pages`) therefore
replaces exactly the cells it took, and every other cell stays at the run that took it last.
The newest record wins whatever its status: a cell that failed on its latest capture shows as
failed, not as an older photograph.

The module reads the paths the runners write, and refuses (as a warning naming the run) any
other:

| Cell | Path under its run | Files |
|---|---|---|
| a variant on the web | `web/<slug>/<variant>/<width>.<look>.<surface>` | `card.png`, `probe.json` |
| a variant on a device | `ios/<slug>/<variant>/<look>.<surface>` (and `android/`) | `screen.png`, `card.png`, `probe.json`, `a11y.json` |
| an interaction state | `web-states/<slug>/<name>.<row>/<width>.<look>.<surface>` (the name: the state, or `<state>-<variant>`, `<state>-<variant>-inside` for one inside its example's overlay) | `state.png` (a reached state), `probe.json` |
| a pattern or template page | `web-pages/<kind>-<slug>/<width>.<look>.<surface>` | `viewport.png`, `section.<key>.png` per section, `probe.json` |
| a page on a device | `ios-pages/<kind>-<slug>/<look>.<surface>` (and `android-pages/`) | as a device variant's |

A state's path names the state (one of the recipes' six) and the row of the browser card it
was reached from; the example its recipe applies it to is on its record. A state its recipe
could not reach has the status `state-not-reached`, its reason as the cell's error, and no
photograph. A page's sections are files of its one cell, never a level of its path.

1. `bun run audit:analyze` (`tools/audit/analyze.ts`) writes `analysis.json` beside each
   current cell's `probe.json`. Derived data: it is rewritten on every run, since a cell's
   structure verdict depends on its peers' current captures. Every web cell is read the
   same way, as **regions** each judged by its platform's floors and photographed somewhere:
   a variant's three platform rows in `card.png` (the card the boxes are measured from); a
   reached state's row and the panel it opened (when the row does not draw it) in
   `state.png`; a page's sections, each in its own `section.<key>.png`. A region's texts are
   placed in its photograph by where the probe measured them from in the viewport (its
   `origin`) less the shot's clip (a row or a section with the margin its paint needs, or
   none for a viewport shot).
   - **Contrast.** Where the probe resolved a text's background from the DOM, its verdict
     stands (method `dom`: fail under the 4.5 or 3 it owes). Where the DOM could not say (a
     backdrop filter, a gradient, an image: every glass cell), only the background is read
     from the photograph, method `painted-ink+pixel-background`: the ink is the text's colour
     as the probe recorded it, with its own alpha (an SVG text's fill-opacity, a
     placeholder's opacity: `colorAlpha`) and the opacity groups its backdrop is not in
     (`ownOpacity`), composited over that background; the background is the dominant colour
     of the text's box (narrowed to the ink's bounds, every pixel at least 1.25 in contrast
     from the box's median, one pixel of margin) among the pixels that are neither ink nor
     antialiasing (at least half as far from the ink's colour as the 95th-percentile pixel),
     binned 16 levels a channel and averaged within one bin of the fullest. A photograph shows
     a glyph's ink only in its thickest pixels, so reading the ink off the pixels reads thin
     text low (the destructive alert's wrapped body, `rgb(59, 60, 92)` on its blush frost,
     read 2.74 that way and reads 8.54 this way; its solid twin is 8.82 on the DOM); the
     background fills most of the box and reads true. A text inside dimming groups with its
     backdrop (`shared`: a pressed control at 0.9 dims its fill and its label together) shows
     both mixed with whatever lies behind the group, which the photograph shows around the
     group's box, not under the text: that colour is read from a 3 px ring just outside the
     box (`behind`) and the ink painted as `a*s*ink + (1 - a)*B + a*(1 - s)*behind`, with `a`
     the ink's own alpha, `s` the groups' opacity and `B` the background read. Dimming the ink
     over the photographed fill read the pressed Button's label at 3.70 (5.66 in dark) where
     the DOM says 4.09 (6.8); leaving it undimmed read the pressed Dialog's Cancel at 9.71
     where the DOM says 7.14; the ring reads both within 1.5%. A text whose painted colour the
     probe cannot give (a colour it cannot read, a transparent one, an SVG or placeholder text
     in a probe older than `colorAlpha`) falls back to reading both from the pixels, method
     `pixel-percentiles`: the 10th and 90th luminance percentiles of the ink's bounds; the
     reason says why. Either way the background is a sample, so neither says "fail": under 8/9
     of what the text owes (4.0 for 4.5, 2.67 for 3) is `fail-likely`, from there to what it
     owes `review`. A disabled control's text owes nothing (WCAG 1.4.3's inactive exception);
     a text something paints over, one scrolled partly out of its scroller's view, or one its
     photograph does not show is not sampled, and says why.
   - **Calibration** (`bun run audit:calibrate`, `tools/audit/calibrate.ts`). It runs both
     pixel methods over every solid text the DOM resolved, in the photograph the analysis
     would read it in (a card, a state's shot, a page's section, placed the same way), as if
     the DOM had not, and sets each glass text a method flags beside its solid twin (the same
     text in the same region of the same cell, width and look) and what the DOM says of the
     twin. A region placed wrong in its photograph reads the wrong pixels, so the solid
     readings of the states and the pages are also the check of their placement. On
     2026-10-09, over the current captures (1,164 web cells: 996 variant, 132 reached state
     and 36 page cells; the runs in "Measured end to end" below and 1e's earlier ones of
     alert, chip and switch), 8,063 solid texts with 8,032 DOM passes and 31 DOM fails:

     | | `painted-ink+pixel-background` | `pixel-percentiles` |
     |---|---|---|
     | DOM passes read `fail-likely` (false) | 0 (0.0%) | 40 (0.5%) |
     | DOM passes read `review` | 0 (0.0%) | 52 (0.6%) |
     | DOM fails read `fail-likely` | 21 of 31 | 21 of 31 |
     | DOM fails read `review` | 10 of 31 | 10 of 31 |
     | DOM fails read `pass` (missed) | 0 | 0 |
     | reading against the DOM's, variants (6,615 texts) | -2.8% to +7.6%, median 0.0% | -73.4% to +1.2% |
     | reading against the DOM's, states (326 texts) | -0.3% to +1.5%, median 0.0% | -15.6% to +1.8% |
     | reading against the DOM's, page sections (1,122 texts) | -1.2% to +2.7%, median 0.0% | -73.0% to +4.1% |
     | glass `fail-likely` whose solid twin passes on the DOM | 26 of 47 | 57 of 69 |
     | glass `review` whose solid twin passes on the DOM | 45 of 55 | 67 of 77 |

     Every DOM fail is flagged; the 10 read as `review` are the dismissible alert's dark close
     glyph (4.36) and the pressed Button's solid label (4.09), both inside the 4.0 to 4.5 the
     thresholds call review. The +7.6% is a code pill wrapped over two lines of a paragraph,
     whose box spans the paragraph's white as well as the pill; the +2.7% a page heading. On
     glass, the 21 `fail-likely` texts whose twin fails are the selectable data table's dark
     header and row glyphs and the dismissible alert's blush close glyph; the 26 whose twin
     passes are the sign-in template's brand panel (`#696b8d` muted text on its
     primary-tinted card, 3.79 in blush and 3.73 in mint at every width, 24 texts), the
     pressed Button's dark glass label (3.97: under glass the press dims the label alone, over
     the brand pane) and the invalid Input's value in blush (3.81). The 45 `review` texts
     whose twin passes are the destructive button's label on brand-tinted glass (4.49 against
     5.75 in solid), the selectable chip's dark label (4.48), the sign-in brand panel in dark
     (4.05), the open and pressed Dialog's Confirm label in dark (4.36) and its "Duplicate
     charge" text in blush (4.15), and the pressed Button's blush glass label (4.06): reviews
     a reader settles by looking. Before this
     calibration covered states and pages it measured 6,081 variant texts only, with the same
     zeroes on the passes; the state and page placements were checked by these numbers, not
     assumed.
   - **Type.** The smallest painted size (the probe's computed size times its glyph scale)
     and the counts under the 10 px source floor and the 12 px body floor.
   - **Targets.** Per platform, the interactive boxes under 24 px (web), 44 pt (iOS) and
     48 dp (Android; a hitSlop is not observable), each with the region it is in; on an
     Android device, the nodes a user acts on (clickable or checkable) under 48 dp in the
     accessibility dump.
   - **Regions.** Per region (a row, the panel, `section:<key>`), its texts, smallest font,
     contrast fails, likely and review, and small targets, so a page's index can say which
     section a finding is in.
   - **Structure invariance.** A cell's tree must be the same across the looks and surfaces
     of its group at one width: a variant's web row (its `ariaSnapshot()`), a state's row
     with the panel it opened, a page's sections in order. The most common tree of the group
     is the group's (a tie goes to blush solid's); a cell that differs is flagged
     `structure-varies` with the first line that differs. A failed cell takes no part.
   - **Interaction states.** A reached state keeps the flags its capture gave it: its own
     (`STATE_FLAGS` in `e2e/support/state-recipes.ts`: `focus-ring-missing`,
     `focus-ring-hidden`, `focus-ring-colour`, `expanded-not-announced`,
     `error-not-described`, `disabled-tab-stop`, `hover-unstable`) and its release's
     (`RELEASE_FLAGS`: `press-not-cancelled`, `press-selects-label`,
     `inspection-not-cleared`, `overlay-not-closed`), split under `state` in
     `analysis.json` beside the state, the row, the example and whether it was reached. Both
     tables are typed into the recipes, so a recipe cannot raise a flag the index cannot
     explain. A state not reached is filed under `state-not-reached` with its reason and its
     release's flags, and nothing else, since nothing was photographed or probed.
   - **Native accessibility.** Android: every clickable or checkable node is named by its
     own label or by a named node inside it, as TalkBack reads it. iOS: XCUITest through
     Maestro reports no traits, so the check is that no element is announced by its value
     alone.
   - **Flags.** The capture's own (`render-failed`, `problems`, `text-floor`, `contrast`,
     `clipped-text`, `small-target`, `small-visible-target`, `overflow`, `axe`, and a
     state's), and the analysis' (`failed` for a cell its record says failed, whatever it
     left on disk; `contrast-likely`, `contrast-review`, `structure-varies`,
     `state-not-reached`; on a device `unstable`, `problems`, `a11y-unnamed`, `a11y-error`,
     `small-visible-target`).
2. `bun run audit:sheets` (`tools/audit/sheets.ts`) writes JPEG contact sheets under
   `.audit/current/<slug>/sheets/`:
   - per variant, under `sheets/<variant>/`: `card-solid.jpg` and `card-glass.jpg` (the
     browser card, widths x looks), `row-<ios|android|web>-<width>.jpg` (one row of the
     browser card cut at its box in `probe.json`, looks x surfaces), `native.jpg` (the iOS
     and Android device cards x the six looks and surfaces), `compare.jpg` and
     `compare-glass.jpg` (per look, the browser's iOS row at phone width beside the iOS
     device's card, and the same for Android);
   - per component with states captured: `states.jpg` at desktop width, where every state
     is, then `states-tablet.jpg` and `states-phone.jpg`, where only the overlays are: a row
     per state and the browser card's row it was reached from (`open.ios (On hover)`), in the
     recipes' order, by the six looks and surfaces; each tile is the state's `state.png` (the
     row with its margin, or the viewport an overlay opened in) with the state's and its
     release's flags under it in red (`flags: hover-unstable`), and a state not reached is a
     hole saying why;
   - per pattern or template page: `viewport-solid.jpg` and `viewport-glass.jpg`, the first
     screen (`viewport.png`) at every width by the three looks; each section's own
     photograph is linked from the page's `index.md`.

   Every tile is labelled with its cell id and the commit it was captured at
   (`commit b87e514 dirty`); every sheet's title names the runs its tiles come from and how
   many commits they span, and where they span more than one, a tile whose commit is not
   the sheet's most common one has its commit in bold blue, so a sheet that mixes a fresh
   capture with an older one says so on its face. A cell that failed, was not reached or was
   never captured is a labelled placeholder. Neither edge of a sheet passes 1600 px: the
   tiles share one scale (relative sizes stay true, a phone card narrower than a desktop
   one), no more than the sharpest source's own density, in whichever orientation scales
   them larger. A grid whose tiles would fall under 0.6 px a layout unit (a 12 px body line
   about 7 px tall, the smallest a reader still reads in a JPEG) is cut into numbered sheets
   (`card-solid-1.jpg`, `states-2.jpg`, ..., each titled with what it holds, such as
   `sheet 3 of 4: widths: desktop; looks: blush, mint`) along the axis a reader does not
   compare across: a card or page sheet per width, so a width's looks stay side by side; the
   other sheets per row (a look, a state), as many neighbouring rows a sheet as stay
   readable together; a slice still too large by the other axis too. A card too tall for the
   floor even alone (data-table's `stacked` at phone width, 342 x 2362 CSS px) is drawn as
   large as 1600 px allows, beside the looks that fit with it. A sheet with no picture is not
   written, and a variant's sheets directory, a component's state sheets and a page's sheets
   are removed before they are written. A desktop overlay photographed in the 1440 x 900
   viewport is the largest state tile: four looks and surfaces a sheet at 0.64 px a layout
   unit, so Tooltip's three open rows take six of its seven desktop sheets.
3. `bun run audit:index` (`tools/audit/index.ts`) writes `.audit/current/<slug>/index.md` per
   component, pattern or template: the checklist, the sheets (a numbered sheet linked by its
   number), the runs its cells come from (commit, source fingerprint, what served them), its
   flag counts, and one row per cell with its status, flags, axe violations by impact,
   smallest painted font, contrast (DOM fails, pixel fail-likely, pixel review), overflow,
   clipped text, small targets, console problems, and its run, commit and fingerprint. A
   component's interaction states have their own section (how many were reached and not,
   and every state and release flag its states carry with what it means) and their own
   table: each state cell with its example, reached or the reason it was not (whole), its
   state flags, its release flags, its other flags and the same measures. A page's index
   has a **Sections** table: each section, by width, linked to its photograph in every look
   and surface, with what the analysis found in it (`contrast 0/4/0`, `2 small`). Its
   "Captured" line counts states against what a full `--states` sweep plans for the
   component (`planStateCapture`). `SUMMARY.md` ranks every captured component and page by
   its cells' flags, with its states captured and not reached and its release flags, then
   lists every state not reached (per component, state and row: the looks and surfaces and
   the first reason) and every release flag with what it means and where it fired, and names
   the components never captured; `current.json` is the same selection for tools (with each
   state's state, row, example, reason and flags, and each page cell's section photographs),
   and the `--run` names it was built from. A cell's flags are its analysis' when the analysis
   is of that capture, else the capture's own, and the index says how many are not analyzed.
   `--only` narrows the `index.md` files written; `SUMMARY.md` and `current.json` are always
   rebuilt whole, and a whole build removes the `index.md` of a component or page with no
   current cell, so no page of the view links to a capture the view does not hold.
4. `bun run audit:prune` (`tools/audit/prune.ts`) deletes a run only when nothing a reviewer
   needs is in it: it is not one of the newest `--keep` (default 2) runs of its platform, it
   has finished, and every cell it holds has at least `--keep` newer captures in other runs.
   The newest two captures of every cell (the before and the after) survive, and a full
   sweep is never deleted while a later partial re-capture covers only some of it. A view
   built before newer captures arrived can still point at a run that has become removable,
   so once a run is deleted the prune rebuilds `.audit/current` from the runs that remain
   (keeping the `--run` names the view was built from that still name a run), checks every
   link of the view (each Markdown link of `SUMMARY.md` and every `index.md`, each run, cell
   file and section photograph `current.json` names) and exits 1 if one points at nothing.
   The current view never loses a cell and never dangles. The contact sheets are images and
   keep what they showed; `bun run audit:sheets` redraws them from the current captures.
   `--dry-run` says what would go, why the rest stays, and how many entries of the view
   point into it.

The readers' tests run on real records: `tools/audit/fixtures/runs/` holds three runs of
this capture cut down to a few cells (a variant card, button and slider and heatmap and
tooltip states, the sign-in template at phone width in blush glass) as the runners wrote
them, and `tools/audit/fixtures/earlier-runs/` two earlier captures of one state cell for
the pruner (`tools/audit/fixtures/real-runs.ts` says what each holds).

### Measured end to end (2026-10-09)

Against a static export of this checkout served on its own port, 6 workers, on this Mac:

| Step | Command | What it took |
|---|---|---|
| variants | `audit:web -- --only=button,tooltip,heatmap,data-table --looks=blush,dark` | 504 of 504 cells ok in 2 min 48 s (1.6 s a cell), 48.1 MB |
| states | `audit:web -- --states --only=button,tooltip,dialog,heatmap,histogram,slider,input --looks=blush,dark` | 140 cells (19 recipes) in 52 s (1.8 s a cell), 20.3 MB; 132 reached, 8 not reached (Input's Disabled, read-only rather than disabled; the Heatmap's press on a day, which a resting pointer has already opened), flagged `hover-unstable` 36, `press-not-cancelled` 4 (Slider), `error-not-described` 4, `focus-ring-missing` 2, `focus-ring-colour` 1, `focus-ring-hidden` 1 |
| pages | `audit:web -- --pages --only=template-signin,pattern-glass` | 36 cells (9 sections) in 40 s (6.1 s a cell), 36.3 MB |
| analysis | `audit:analyze` | 1,424 current cells (1,248 variant, 140 state, 36 page; 252 of them iOS and Android) in 3.9 s: 31 DOM fails, 7,973 texts read against their photographs (all by the painted ink), 47 fail-likely, 55 review, 246 unmeasured (all scrolled out of their scroller's view) |
| calibration | `audit:calibrate` | 18.8 s over 1,164 web cells (above) |
| sheets | `audit:sheets` | 970 sheets in 34.7 s, 103.2 MB (109 KB a sheet), tile scales 0.60 to 2.17 px a layout unit (median 1.08), 147 numbered; 39 state sheets for 7 components and 12 page sheets for 2 pages, 8.1 MB |
| index | `audit:index` | 0.1 s; 13 `index.md`, 2,609 Markdown links (1,578 photographs, 970 sheets) and 1,603 paths in `current.json`, every one resolving (checked by a walker of its own, besides `brokenLinks`) |
| prune | `audit:prune -- --dry-run` | 3 of 17 runs would go (the first capture of each kind, every cell of which has two newer captures since), 3 entries of the view pointing into them |

The native runner photographs resting examples and pages only, so a state on iOS or Android
is judged from the web's iOS and Android rows until it gets recipes of its own, and no
native page capture exists yet to draw a page's device sheet from. The fixer loop (1h) is
still to come.

A fixer re-captures one component with
`bun run audit:web -- --only=<slug> --base=http://localhost:8081` against this checkout's
Metro while iterating (the run is recorded as a `live dev server`; from a worktree, start
that worktree's own docs dev server, since 8081 shows the main checkout's source), and
`bun run audit:native -- --platform=ios --only=<slug> --dev` (and `android`) on the booted
devices, with `bun run audit:sheets -- --only=<slug>` and `bun run audit:index -- --only=<slug>`
to refresh that component's contact sheets and index under `.audit/current/`. The final
check is the turn's after phase against a rebuilt export and Release builds,
`bun run audit:turn -- --slug=<slug> --phase=after` (see "One component's turn").
