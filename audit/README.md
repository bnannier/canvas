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
  with no React Native import. Its route, source files, markdown and exports; which of its
  builds differ per platform (`tools/skins/divergence.ts`, read per export) and which are in
  the docs' platform-skin registry; its row in `PLATFORM-REFERENCES.md` (treatment, build,
  and whether each platform cell is a real reference link or a `none` note); its
  `tools/materials/manifest.ts` entries; its hand-off parity records split into open gaps,
  settled divergences and metric gaps (from `HANDOFF-PARITY.md`, the report generated from
  `tools/handoff-parity/divergences.json`); its interaction evidence and overlay recipe;
  the test and e2e files naming its exports or route; and its `MeasureProps`, `minTarget`
  and `useMinTargetSlop` adoption. `bun tools/audit/facts.ts <slug>` prints the same as JSON.
- **Variants** (generated, between `<!-- audit:variants:begin -->` and
  `<!-- audit:variants:end -->`): one row per variant with a tick cell per platform (Web 18,
  iOS 6, Android 6) and a notes cell. Rows are merged by variant key on regeneration, so
  ticks and notes survive an example being added, removed or relabelled. A page's rows are
  the whole page and then one per section, keyed by position.
- **Universal rubric** (seeded once): the 11 items applied to every component, each with its
  evidence source (S source or test read, A accessibility tree or DOM probe, P photograph,
  N native device check). Severity follows rn-library-audit: critical, high, medium, low.
- **Family checklists** and **Specific checks** (seeded once): the component's families and
  its own row from the plan, with the native shape it is owed per `PLATFORM-REFERENCES.md`
  (HIG keeps the iOS control's shape, M3 the Material 3 shape, DF means the native skin is
  the Dark Factory look and should alias the web skin). The seed is data,
  `tools/audit/plan-specifics.ts`, so a new checklist always starts from the same text.
- **Findings** (hand-maintained): one row per finding with id, severity, cell, summary,
  status (`open`, `verified`, `fixed`, `wontfix` with the owner's reason, `duplicate`) and
  the fix commit.
- **Sign-off** (hand-maintained): one row per platform with the run id of the after-capture
  run that shows the component passing, the reviewer, the date and the result.

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
| `bun run audit:checklists` | writes new checklists and regenerates the facts block and variants table of existing ones |
| `bun run audit:checklists:check` | fails on a route with no checklist, an orphan checklist, a stale facts block, variant rows that drift from the inventory, or a missing sign-off section; runs in CI (`validate.yml`) and the pre-push hook |
| `bun run audit:status` | counts ticked variant cells per platform, ticked checklist items, open findings by severity and signed-off platforms across every checklist (`--json` for the rows) |
| `bun tools/audit/facts.ts <slug>` | prints one component's facts as JSON |

When a kit change alters a fact (a new test, a skin that stops aliasing the web skin, a
reference row, a materials entry), run `bun run audit:checklists` and commit the result,
the way `docs:gen` is run after a markdown change.

## Capturing (pending)

The capture runners are the next pieces of the audit infrastructure and are not in the
repository yet: the web runner (1c, `audit:web`), the interaction-state recipes and page
shots (1d), analysis and contact sheets (1e, `audit:sheets`, `audit:index`), the in-app
native driver (1f), the native host runner and builds (1g, `audit:native`,
`audit:native:build`) and the fixer loop (1h). Until they land, the checklists are reviewed
against the existing evidence (`bun run e2e`, `bun run looks`, the docs three-up) and the
cells are ticked only from photographs.

Once they land, a fixer re-captures one component with
`bun run audit:web -- --only=<slug> --base=http://localhost:8081` against Metro while
iterating, then the same against a rebuilt export for the final check,
`bun run audit:native -- --platform=ios --only=<slug> --dev` (and `android`) on the booted
devices, and `bun run audit:sheets -- --only=<slug>` and `bun run audit:index -- --only=<slug>`
to refresh that component's contact sheets and index under `.audit/current/`.
