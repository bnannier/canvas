---
name: canvas-new-component
description: Add a new component (or extend one) in the Canvas RN UI kit — the full validated recipe from shared shell + per-OS skins through docs registration, changeset, and the verification battery. Use whenever creating a kit component, adding a semantic boolean prop, or wiring a component into the docs.
---

# Add or extend a Canvas kit component

Canvas components are built once as a shared shell + per-OS skins, registered in
four places, documented via a co-located `.md`, and shipped with a changeset.
Skipping any registration step hard-fails the build, so follow all of it.

## 0. Decide what you're building

- Kit already has the component? Use it. Almost-fits? EXTEND it
  (backward-compatibly) instead of creating a sibling. Only create new when the
  capability has no home. (AGENTS.md "Dogfood the kit".)
- Styling API is flat BOOLEAN props only — one boolean per choice, grouped into
  mutually-exclusive axes with a documented first-match precedence
  (`toneOf`/`sizeOf` resolver functions). NEVER `variant="..."`/`size="lg"`.
- No `style` escape hatches: `style` may exist for sizing/composition only
  (width/maxWidth); the docgen guardrail hard-fails examples that pass banned
  style keys.

## 1. The file recipe (src/atoms|molecules|organisms/<name>/)

Six files, modeled on `src/atoms/badge/` (Light treatment) or
`src/atoms/typography/` (Shared treatment):

- `<name>.shared.tsx` — `create<Name>(skin)` factory: structure, prop interface,
  axis resolvers (first-match precedence, largest/most-specific first), semantic
  token colors, accessibility. All logic lives here ONCE.
- `<name>.styles.ts` — the `<Name>Skin` interface + `webSkin`/`iosSkin`/`androidSkin`.
  - "Shared" treatment (layout/data-viz, platform-neutral): all three skins
    reference the SAME object — intentional, comment it.
  - "Light" treatment: per-OS deltas only (radius, label type/tracking, press
    feedback: Android `ripple` config vs iOS/web `pressedOpacity` — never both).
- `<name>.tsx` / `<name>.ios.tsx` / `<name>.android.tsx` — thin:
  `export const <Name> = create<Name>(webSkin)` etc. Metro resolves by extension;
  web bundlers fall back to the base file. Export types from each.
- `<name>.md` — the docs source (see §3).

Conventions inside the shell:
- Import primitives/theme from `../../style/index.js` (with `.js` suffixes — ESM).
- Colors from `useTheme()` tokens; scheme-dependent palette picks use the
  `{ tokens, dark } = useTheme()` + `palette["hue-step"]` pattern (see Badge).
- Accessibility: role + label + state, AND the RNW dual-alias (`aria-*`
  alongside `accessibilityState`) because react-native-web drops
  accessibilityState (see `test/a11y-state.test.tsx`).
- `role="img"` not `"image"` (RN Role type).
- Android bounded ripple on a ROUNDED node needs `overflow:"hidden"` or the
  `rippleClip()` helper (`src/style/ripple.ts`), else it bleeds past corners.

## 2. Registration (all four, or the build fails)

1. Barrel: `src/atoms/index.ts` (or molecules/organisms) —
   `export * from "./<name>/<name>.js";` (alphabetical).
2. Docs example scope: `docs/src/core/live-scope.ts` — add to BOTH the import
   list and the `LIVE_SCOPE` object. Missing ⇒ `docs:gen` throws tagViolations.
3. Docs catalog: `docs/src/core/data/components.ts`: `{ slug, name,
   category }`; use `dir:` when the slug differs from the source directory
   (e.g. slug `row-column`, dir `layout`). The description is the `.md`
   intro's first paragraph (see §3), never a field here.
4. Nav: `docs/src/data/nav.config.json` — add the slug to its category group.
   `cd docs && bun run check:nav` must pass (it cross-checks 3↔4).

## 3. The .md grammar (parsed by tools/docgen/parse-md.ts)

```
# <Name>           (the component's name in docs/src/core/data/components.ts)
Description.       (the intro's first paragraph: the page's lead and its search entry)
More intro.        (optional paragraphs and bullet lists: the overview under the lead)
## Usage
one ```tsx fence   (prose beside it is the Default example's note)
## Variants
Prose.             (optional: a note on every example)
### <label>        (exactly ONE fence; prose beside it is this example's note)
## Do & Don't
### <title>
**Do**: caption    (one paragraph: it may wrap, and a blank line ends it)
fence
**Don't**: caption
fence
## <section>       (optional guidance of the page's own, only after Do & Don't:
                    prose, lists, "###" headings and live-example fences)
```

Every line reaches the page (`parseDoc` in parse-md.ts reads it into one document
model and the generator emits all of it): the intro's first paragraph is the
component's description, generated into `docs/src/core/descriptions.ts`, which the
page's lead and the search index read, so the registry entry in
`docs/src/core/data/components.ts` carries no description of its own and the `.md`
is the one place it is written. Keep that paragraph a short, true summary; the
detail goes in the paragraphs after it, which render as the overview under the lead.
A note shows under the Playground rail while its example is selected. A guidance
section renders after Do & Don't, its fences as live examples over their source
under the same guardrails as the Variants. Prose is a paragraph or a `-` bullet
list (one paragraph per item) of inline Markdown: a code span (`` `cover` ``) renders
in the mono face, `**strong**` at semibold, and `\*` escapes a literal star. Nothing
else Markdown has (a link, emphasis, an image, raw HTML, an ordered or nested list,
a block quote, a table, a heading below `###`) renders, so the gate refuses it (S8).

Write every heading the one way: the `#` run at the start of the line, one
space, the text, nothing after it. Markdown and the parser also read
`##  Variants`, `##\tVariants`, an indented heading or a closing `#` run as the
section, but the gate rejects those spellings so the source reads the way the
page renders.

`docs:gen` and `docs:gen:check` (the pre-push hook and CI) refuse to generate
unless every page has this shape, and `tools/docgen/doc-structure.test.ts` runs
the same check in `bun run test` (`docStructureViolations` in parse-md.ts, walked
over the pages by `tools/docgen/pages.ts`). Each failure is located and names its
rule:

- **S1** The page opens with `# <Name>`, exactly the registry name, and has no
  other `#` heading. Every page documents a registered component, and every
  registered component (its `dir`, or its `slug` when they match) has a page; a
  missing one is reported at its entry's `slug` line in the registry.
- **S2** A prose intro sits between the title and `## Usage`, with no fence,
  `###` heading or Do/Don't marker in it, and it opens with a paragraph (the
  description), not a list.
- **S3** `## Usage`, `## Variants` and `## Do & Don't` each appear exactly once,
  in that order. Every page carries all three, the primitives and the charts
  included, and every `##` names its section.
- **S4** Usage holds exactly one non-empty fence and no `###` heading or
  Do/Don't marker.
- **S5** Variants holds at least one `### <label>`; each has exactly one
  non-empty fence, and no fence sits before the first one. No Do/Don't marker
  sits here. Show only what the kit renders truthfully (a placement the
  component does not implement gets no example).
- **S6** Do & Don't holds at least one `### <title>` group and no marker or
  fence outside one. A group is exactly one `**Do**` and one `**Don't**`, each
  with a caption and exactly one non-empty fence of its own, and the Don't fence
  differs from the Do fence. The page shows only the captions and the fences, so
  any other prose in the section (a second paragraph under a marker, a note
  after a fence) fails. Every pair teaches the page's own component, and its
  captions describe what the fences really render.
- **S7** Any other `##` is a guidance section (Button's `## Touch area`): it goes
  after Do & Don't, never before, holds something (prose, lists, `###` headings
  over something, non-empty fences), and holds no Do/Don't marker, so a pair's
  `###` title typed as `##` (which would take that pair and every one after it
  off the page) fails here. Its name is its own: not `Props`, which the page
  generates, and not one used twice.
- **S8** Every non-blank line reaches the page as written: the document model
  places it, and it opens no construct the page does not render. A line another
  rule already explains (in the same `##` section) is left to that rule, so a
  page with no finding has nothing dropped.
A heading spelled loosely fails under the rule that owns it: S1 for `#`, S3 for
`##`, and for `###` the rule of its section.

- Every JSX tag in a fence must be in LIVE_SCOPE; fences are type-checked by
  `tsc` against the real exports.
- Usage/Variants/Do fences must be shim-free (guardrail hard-fails banned
  `style={{…}}` keys). `Don't` fences are exempt on purpose.
- Justified rare exception: a `// docgen-allow-style: <reason>` comment on the
  line where the style begins.

## 4. Changeset

Anything exported from `@nannier/canvas` ships with a changeset:
`.changeset/<slug>.md`, `"@nannier/canvas": minor` for new
components/props, `patch` for fixes. Never `npm publish` locally — CI releases.

## 5. Verification battery (run all; each must be green)

```bash
bun run typecheck                                  # kit
bun run docs:gen                                   # regenerates + guardrail (hard-fail)
bunx tsc --noEmit -p docs/src/core/tsconfig.json   # generated example modules
cd docs && bun run check:nav                       # nav ↔ catalog sync
```

Commit the REGENERATED `docs/src/core/{examples/**,registry.ts,raw-md.ts}` with
your change — the pre-push hook runs `docs:gen:check` (`git diff --quiet`) and
rejects stale codegen.

## 6. Visual QA

Metro does NOT hot-watch the symlinked kit: restart the docs app with
`cd docs && npx expo start --clear` or the running bundle is stale. Verify the
component page in light AND dark before calling it done. If no browser/app is
reachable, say so explicitly — green typechecks are not visual verification.
