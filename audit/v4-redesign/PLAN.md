# Canvas v4: the "Light as material" redesign

Owner request, 2026-10-27: restyle every component and the docs to match the design
hand-off in `~/Downloads/canvas_v4` (served locally for comparison), and ship it as
4.0.0 (the owner said "bump to 4.0.0" in that conversation). The hand-off replaces Dark
Factory as the design language. Where the prototype and the repo disagree on an API, the
repo wins: the prototype only draws what the repo's props already describe.

## Done means

1. Every one of the 107 components renders like its hand-off card and detail page on the
   web, iOS and Android skins, in dark and light, solid and glass, for all five accent hues.
2. The docs site has the hand-off's chrome and pages: the floating pill navbar, the grain,
   the Library landing, one page per section with its rail and card grid, a detail page per
   component (Playground, Variants, Sizes, States, Anatomy, Props, Accessibility, Platforms,
   Usage, Tokens, Previous/Next), the Skins page and the Templates page.
3. Lookout's design-parity judge, with the `codex:gpt-6-astra` challenger, files no open
   divergence against the hand-off reference images, and every fix it filed was ruled by
   `lookout verify-fix`.
4. Every glass, motion and gradient change has a shipped-surface evidence row in
   `tools/native/liquid-motion.md` that matches its reference card.
5. `bun run ci:local` passes before every push; the visual baselines are re-minted.

Out of scope: any API change beyond the new palette names and the display font role; the
prototype's machinery (`support.js`, `cv-jsx.js`).

## Decisions (the agent's, recorded per the owner's "decide, don't ask")

- **D1 Design language.** The hand-off replaces Dark Factory. CLAUDE.md and AGENTS.md get
  a rewritten "Design language" section; the DF tooling (tools/darkfactory, check-df,
  df:tokens, df:vendor, the DF reference cards) is retired, not left half-alive.
- **D2 Accent.** The accent is `oklch(L C hue)` exactly as the hand-off writes it. RN cannot
  parse oklch, so the kit converts with the reference Oklab matrices and per-channel
  clipping, which matches Chrome's rendering of the hand-off to within one unit
  (measured). The CSS hand-off keeps the literal `oklch(... var(--hue))` form.
- **D3 Palette axis.** `Palette` becomes `"violet" | "cyan" | "mint" | "rose" | "amber"`
  (hues 285, 205, 165, 20, 75), spelled as ThemeProvider booleans (`<ThemeProvider cyan>`),
  violet the default. The accent applies in BOTH schemes (the hand-off has no single dark
  palette). This is the breaking change the 4.0.0 major carries: `blush` is gone.
- **D4 Roles.** The hand-off's surfaces map onto the existing semantic roles (bg to
  `background`, sf to `card`, sf2 to `popover`, sf3 to `secondary`/`muted`/`accent`, tx2 to
  `muted-foreground`, ln to `border`, ln2 to `input`/`field-border`, ion to `primary` and
  `action`, ion-ring to `ring`, ok/warn/bad to the status roles, c1..c8 to the chart
  series). New roles only where a skin needs a value no role carries: `subtle-foreground`
  (tx3), `surface-sunken` (bg2), `surface-raised` (sf4), `highlight` (hl), `glow`
  (ion-glow), and the four shadows. Roles keep their FUNCTION, not the prototype's name:
  `input` stays the non-field control boundary solved to the WCAG 1.4.11 3:1 floor (the
  hand-off's `ln2` hairline is ~1.5:1 there, a recorded deviation), `field-border` takes
  `ln2` under the existing field exception, and every palette is validated against the
  contrast floors (review R1).
  - *As landed in Phase 1.* The same function rule covers text inks: `primary-text` and
    `info` (per palette), `inverse-primary`, and `destructive-text`, `success-text`,
    `warning-text` (per scheme) are solved by `tools/v4/derive-inks.ts` (through `tools/v4/ink-floor.ts`) into the generated `src/style/solved-inks.ts`, which walks the
    hand-off's oklch lightness at its own hue (in-gamut chroma, so the hue holds) until
    every bed the ink is drawn on clears 4.5:1 exactly and through one-channel rounding;
    an ink that already passes keeps the hand-off's value. Fills and washes are not moved.
    `ring` is the solid accent (the hand-off's translucent `ion-ring` is ~1.6:1); the
    ring keeps the hand-off's 2 px gap and 2 px band. ChatGPT agreed (2026-10-27).
- **D5 Radii.** The component renderers (`cv-kit*.js`, `K.PF`) are the measurement source,
  over the Foundations prose where they disagree: web control 10, field 10, card 16,
  dialog 20, menu 16, sheet 22, checkbox 5, tile 12; iOS and Android keep their native
  rows, which the hand-off's `K.PF` ios and android rows agree with (capsule controls,
  8 and 4 fields, 12 cards). Amended in phase 1: the earlier "iOS dialog 22, alert 14"
  exception came from a template's chrome, not the renderer, so it is settled per
  component when the Dialog and AlertDialog skins are redone (phase 4).
- **D6 Type.** Bricolage Grotesque (display), Instrument Sans (UI), JetBrains Mono (code) on
  the web skin; SF Pro on iOS and Roboto on Android (the system faces) per `K.PF`. The type
  scale is the hand-off's (display 56 .. caption 12, eyebrow 11 mono). `ThemeFonts` gains
  a `display` role.
- **D7 Glass.** The web material becomes `blur(20px) saturate(1.6)` with a 1px `ln2` rim
  through the shared renderer. The four layer tints stay independent, seeded around the
  hand-off's 62% `--gl` (functional) and held to the legibility floors; solid mode keeps
  each skin's complete opaque look (brand, status and inverse fills included), not a
  blanket `sf2` (review R2). Tuned through the
  tuning harness against a `v4-glass` reference card recorded from the hand-off.
- **D8 Motion.** Specified per control and platform: the web skin presses at `scale(.96)`
  with `brightness(.92)` unless `steadyPress` (the renderer's drawn pressed state, `K.st` in
  `cv-kit.js`, which wins over the prototype's live `.97` pointer handler by D3); iOS keeps its dim and Android its ripple; switch and segmented
  thumbs take the spring `cubic-bezier(.34,1.56,.64,1)`; Reveal takes `cvRev`. A gate for
  each: it runs on the compositor (a CSS transition on the web, the native driver natively;
  Reveal moves off the JS driver it uses today), and Reduce Motion, visibility and stagger
  semantics are preserved. Each is tuned against its hand-off reference (review R3).
- **D9 Docs IA.** The docs take the hand-off's information architecture. Component routes
  stay at `components/<slug>` (the preview links and e2e depend on them); section pages
  are `sections/<section>`, plus `skins` and `templates`. The native docs render the same
  page bodies under their native header and tabs.
- **D10 Version.** One major changeset for `@nannier/canvas` with the owner's authorization
  quoted. A push never authorizes a major (`.github/workflows/deploy.yml`,
  `scripts/release.mjs`), so the release is the Deploy workflow dispatched with
  `major=true` and `major_version=4.0.0` once the last phase lands (review R4).
- **D11 Reference snapshot.** The hand-off is vendored into `tools/v4/handoff/` (token
  block, component data, renderer measurements, browser-sampled accent values and the
  reference images), so CI's design authority is in the repo, not `~/Downloads` (R5).
- **D12 Acceptance beyond pixels.** Contrast, keyboard and focus, responsive sizing and the
  native substitutions are held across the expanded matrix (5 hues x 2 schemes x 2
  surfaces), and native runtime checks must pass on the Mac before release (R6).

## Review

ChatGPT (`codex exec -m gpt-6-astra`, read-only) reviewed D1 to D10 and the phase order on
2026-10-27. It agreed with D1, D2, D3, D5, D6 and D9 and disagreed with D4, D7, D8, D10
and the order; each objection was accepted and folded in above (R1 to R6) and below. No
fundamental disagreement is left open.

## Phase 3 and detail-page decisions (2026-10-27)

Two read-only planning passes mapped the hand-off's docs shell and its component detail page
(`Canvas v4.0.0 Component.dc.html`). ChatGPT reviewed the shell decisions; where it disagreed
the disagreement is recorded here and the call taken.

- **S1 Pill at narrow widths.** The hand-off's pill (1177 px natural width) scrolls sideways
  below about 1209 px. Adopted (ChatGPT): the kit Navbar gains `scrolls`, a horizontally
  scrolling content row with no indicator, instead of folding the links into its menu.
- **S2 Phone bars.** The docs' phone web TabBar and mobile top bar are retired; the pill and a
  drawer of all rooms replace them. Native keeps NativeTabs (ChatGPT agreed).
- **S3 Kit skins pulled forward.** Swatch (five palettes), Navbar (hand-off skin, `compact`
  44 px density, `scrolls`, `hrefs`) and Sidebar (hand-off skin, trailing markers) land with
  Phase 3, so the shell is built from v4 kit parts (agreed).
- **S4 Search.** The hand-off pill has no search; a ghost search icon button with the ⌘K
  shortcut is added. ChatGPT disagreed (an unshown control); kept, because search is a real
  function and touch users have no other way to reach it.
- **S5 Rail dots.** Adopted (ChatGPT): the kit Sidebar gains trailing markers rather than
  omitting the 5 px dots.
- **S6 Grain.** A texture baked from the hand-off's own `feTurbulence` SVG (react-native-svg
  renders no `FeTurbulence`), tiled through the kit `Image` on every platform (agreed).
- **S7 Section routes.** Minimal `sections/<section>` and `skins` routes land with the pill so
  its links work before Phases 5 and 7 (agreed).
- **S8 Glass chip.** The hand-off's "Glass" chip is drawn as the kit `Switch small` labelled
  Glass without the chip frame. ChatGPT disagreed (match the frame); kept, because the
  repo forbids adding to the kit for the docs frame and a hand-built chip is a look-alike.
  Recorded as an open difference.
- **S9 Rail cut.** Adopted (ChatGPT): the rail hides below the hand-off's 760 px window width,
  not the kit's 640 phone tier; it is window-level chrome.
- **S10 Toolbar search prompt.** Adopted (ChatGPT): the prompt takes what the hand-off actually
  renders (its interactive layer's `font: inherit`, 400 at the field's size), not the
  renderer's 700 10.5 px tracked span.
- **S11 Grain source.** The hand-off's runtime template encoder rewrites camelCase
  attributes inside the `--grain` data URI (`baseFrequency` becomes
  `sc-camel-base-frequency`), so its live page and reference images draw a flat veil. The
  baked texture is the AUTHORED noise, judged against strips captured with the vendored
  `--grain` restored: the veil is an accidental encoder bug, not a deliberate override like
  S10's (ChatGPT agreed).
- **P1 Detail page.** Built behind a pilot gate on Button, from generated data only (extended
  `extract-props`, semantics, skin-token and related scans, and `tools/v4/derive-detail-specs.ts`
  porting the hand-off's knob, size, state, anatomy and keyboard specs, validated against
  the extracted props), so Phase 6 is "regenerate and flip the gate".
- **P2 Kit gaps for it.** A 64 px layout gap step, a heading level independent of the visual
  role, `CodeBlock inline copy`, CardMedia hosting live children on a sunken well,
  DescriptionList ReactNode values, DataTable group bands and proportional columns,
  `InteractionOverride` (pinned hover, focus, press) and an anatomy part registry.
- **P3 Kept from the repo.** Variant routes stay (the audit and deep links); Do & Don't stays
  (rule S8 of the doc structure) as a section after Usage; the title is `Typography display`
  (56 against the hand-off's 64) and Cards keep the 16 px radius (against 14 to 20): both
  recorded differences.
- **S12 Swatch pitch.** The pill's hue discs keep their 16 px size but sit 8 px apart, not
  the hand-off's 6: a 22 px pitch fails WCAG 2.5.8's 24 px target spacing (axe
  `target-size` on every page), and 8 is the smallest gap that passes (D1's rule).
- **P4 Knob chips are one tab stop per knob.** The playground's pick-one chip sets were a
  tab stop per chip (60+ stops through the playground); a pick-one set is a radiogroup with
  roving focus, a real gap, so the kit gains a single-select chip group (Phase 4 Controls).

## Phase 4 decisions (2026-10-27)

- **T1 iOS Tabs is the segmented control.** iOS ships UISegmentedControl for switching
  closely related subviews in a screen (HIG, Segmented controls), so PLATFORM-REFERENCES
  names it for the tabs job and iOS Tabs draws the hand-off's `K.PF` ios segmented row
  (ChatGPT agreed). The tab bar stays the app-level navigation row.
- **T2 Kept native shapes the hand-off draws generically.** Android Autocomplete keeps the
  M3 exposed dropdown with its floating label (Material ships the control); iOS FilterPanel
  keeps the trailing-checkmark list (design-language item 6). Both are recorded differences.
- **T3 Hand-off motion not added in Phase 4.** Hover and press transitions the hand-off
  animates are left out until each goes through the tuning harness; the section reports
  list them as open differences.

## Phase 5 decisions (2026-10-27)

A read-only planning pass mapped every section page card and the Library page to kit
components; ChatGPT reviewed the open calls and agreed with each.

- **P5-C1 Link chips.** The hand-off's component chips (26 px pills linking to a component)
  are the kit Chip with a new `href`, following Button's anchor path, rather than an outline
  small Button, whose geometry differs: a link chip is a real capability.
- **P5-G1, G2, T1 Built, static.** The Library's gradient headline word, its radial aurora
  glows (and the glows behind glass specimens) and its tilted six-panel hero collage are
  built as static docs brand illustrations from react-native-svg and RN transforms, through
  the tuning harness. Only their motion (drift, pointer-follow tilt, pulse, rise, weight
  morph) is dropped, under the 2026-09-21 removal; that drop is recorded as a difference.
- **P5-V Vignettes are static frames.** Each section hero's looping vignette is a still
  composition of live kit components in the reference image's state.
- **P5-K Kept from the repo** (recorded differences): the 56 px display role against the
  hand-off's clamp to 112, Card radius 16 against 20, the 19 px lead against 22, the 15 px
  section paragraph against 17.

## The owner's pixel-exact rule (2026-10-28)

Mid-run the owner said: "end of day the hand off is what i want implemneted!", "visually it
needs to pixel perfectly exact with the hand off", "dimensions responsiveness etc should all
be the same as hand-off", "all sections in the hand-off has animations that are missing", and
"Leverage lookout to refine this application", using all of its skills. This overrides every
recorded deviation above. What follows from it:

- **D13 Glass on the web is the hand-off's.** The hand-off frosts only what floats over the
  page (its `--gl` surfaces: the navbar pill, tab bar, dialogs, alert dialogs, action sheets,
  drawers, popovers, the command palette, toasts, carousel arrows, video controls). On the
  web every other surface keeps its complete solid skin in glass mode (`resolveMaterial`'s
  "design" fallback; `floating` on the surfaces that float). Native keeps its materials.
- **D14 Recorded deviations are reversed.** P5-K (the 56 px display role against the
  hand-off's `clamp(56px, 7.2vw, 112px)` headline, Card radius 16 against the Library's 20,
  the 19 px lead against 22, the 15 px paragraph against 17), the solved inks and the 3:1
  `input` boundary (D4) go to the hand-off's values; where a hand-off value misses a WCAG
  floor the report lists it as an accessibility note instead of moving the value.
- **D15 Motion returns.** The hand-off's decorative motion (each section hero's loop, the
  aurora drift, the reveals) is ported, reversing the 2026-09-21 removal for these, each
  through the tuning harness against a recording of the hand-off.
- **D16 Owner copy.** The Library's Index heading advertises the count ("107 components")
  over the hand-off's "Index" caption.
- **D17 Lookout drives parity.** `lookout.config.ts` target `v4` judges every page, every
  component detail page and every template against its `.v4-reference` image; the whole
  loop runs (map, check with every panel, ask, verify, backlog, skills improve), and only
  `verify-fix`, from a session that did not make the fix, closes a finding.
- **D18 Parity evidence is cut per section (2026-10-28).** A whole component page is about
  9000 px tall; Lookout hands anything over 8000 px to the judge in pieces and the judge's
  image reading scales a piece down about five times, so a 2 px radius or a 13 against 14 px
  label cannot be seen. So the hand-off's component page is photographed per section
  (`tools/v4/capture-references.ts`, `components/<slug>/<id>.png` for `header`, `pg`, `var`,
  `sz`, `st`, `an`, `props`, `a11y`, `pf`, `use`, `tok`, `prevnext`), the docs page marks each
  section `data-detail-section="<id>"` on the web (`docs/src/ui/detail/frame.tsx`), and the
  `v4` target carries one route per component and section (`/components/<slug>?section=<id>`,
  a `fit-section-<id>` state growing the window to the section) beside the whole-page route,
  which stays for presence and order. Parity runs use the design-parity and geometry panels
  on the `opus` judge, with the Codex challenger on a phase's acceptance run, web first. The
  owner settled three presences the hand-off lacks, as `neverFile` lines: the Do and Don't
  section (P3), and the Platform skins' example picker, form-factor switcher and code block,
  whose cards keep rendering the chosen example. The anatomy's 1.6 zoom is a cross-platform
  scale transform with the marker maths scaled, never a web `zoom`.
- **D19 The component page's looks are kit capabilities (2026-10-28).** The first Lookout
  run on Button (check-20261028-201446) filed the page's divergences, and each is fixed where
  the hand-off draws it: Typography `code inline` (the prose chip), `pageLabel`, `guideTitle`,
  `guideBody` and `pagerName`; Chip `token` and `square`; Swatch `tiny`, `ring` and
  `decorative`; CodeBlock `unbadged` and the jsx grammar of the hand-off's `hl()`; DataTable
  `reference`, `alignTop` and `footer`, Collapsible `reference`, Typography `specMeta` and `specText`; Card `calloutCorners`, `largeCorners`,
  `stageCorners`, `outlined`, `panel`, `guide`, `linkTile`, `pager`, and CardMedia `stage`
  and `playground`; Button `plainLink`, its own 14 px loading arc on the web and the
  theme-choice disc, and its icon slots take its label ink through the kit's ink context (`src/style/ink.tsx`, read by Icon when no tone is set); Badge `marker`, `disc`, `tier` and `band`; DescriptionList `ruled` and `compact`; ButtonGroup `compact`; CodeBlock `playground`; AnatomyProvider `zoomed` (the 1.6 scale transform with
  the part rectangles mapped) and DetailSpec `fill`; DescriptionList `ruled`. The docs page
  composes them and never styles at a call site. Content the page reads from the current
  docs (paragraphs, examples, prop rows, semantics, tokens) is settled as content in
  `lookout.config.ts`'s never-file list; only how it is drawn is judged.
- **D20 The docs web build loads the hand-off's font files (2026-10-29).** Lookout's judge read
  headings, labels and chips as "bolder than the hand-off" at the same declared weight: the docs
  render static subset TTF faces where the hand-off loads Google's variable woff2 of Instrument
  Sans, Bricolage Grotesque and JetBrains Mono, and the static cuts rasterise heavier. The owner
  chose to load the hand-off's files on the web (native keeps its static faces), which also
  removes the text residue the pixel compare shows on every section.
  *As landed (2026-10-29):* `docs/scripts/subset-fonts.mjs` also cuts the three web files from
  Google Fonts' own variable sources (`docs/assets/fonts/source/`, an OFL beside each) into
  content-named woff2 files under `docs/public/fonts/` with the hand-off's axis ranges
  (Instrument Sans wght 400..700, Bricolage Grotesque wght 300..800 with opsz kept whole,
  JetBrains Mono wght 400..600; 42, 102 and 34 KB) and writes `docs/src/ui/web-fonts.json`, from
  which `docs/src/app/+html.tsx` declares the three `@font-face` rules with `font-weight` ranges
  in its own style element and preloads each file, while `docs/src/ui/fonts.ts` hands the kit one
  family string per role with the hand-off's fallback stack (nothing goes through expo-font on the
  web, whose rule carries no weight range) and `docs/src/ui/fonts.native.ts` keeps the static cuts
  for iOS and Android. The document also carries the hand-off's body rule
  (`-webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility`), which on its own took
  the Button header's pixel residue against `header.png` from 2.7% to 1.22%; with the variable
  files the header measures 1.14% and the previous/next strip 0.29% (0.39% before).
- **D21 The section pages sit at the root (2026-10-29).** `/foundations`, `/layout`,
  `/controls`, `/inputs`, `/navigation`, `/data`, `/charts` and `/overlays`, as the hand-off's
  pages do; `/sections/<section>` redirects there. The owner: "no real point in having the
  sections in the route".
- **D22 The section pages take the component page's loop (2026-10-29).** The owner: "issues like
  that are all over the place in every section". Each page's cards (the hand-off's `#c-<id>`,
  the docs' `showcase-<id>`) and its hero are judged by Lookout against `cards/<id>.png` and
  `heroes/<section>.png`; the showcase frame (cards at radius 20, padding 24, gap 20; the
  300 px hero stage at radius 24) is one fix for every page; the heroes' loops are D15 work
  through the tuning harness, hero by hero, after the geometry.

## Phases (each committed and pushed on its own, CI run locally first; screenshot
baselines and tuning evidence land WITH the visual phase that moves them, never at the end)

0. **References.** Vendor the hand-off snapshot (D11), record its reference images per
   route and the tuning reference cards (glass, press, thumbs, reveal, page look).

1. **Foundations.** Tokens (`src/style/tokens.ts`, `styles/tokens/*.css`), the oklch helper,
   the palette axis (ThemeProvider, `setPalette`, docs theme links, the preview opener),
   type scale and fonts, shape rows, shadows, web glass. Retire the DF tooling; replace its
   parity checks with `tools/v4/derive-tokens.ts` + a parity test over the hand-off's
   formulas. Regenerate DESIGN.md. Update every test the inventory lists.
   *As landed:* the flat page (the scheme's `background`) was pulled forward from Phase 3
   on ChatGPT's advice, since the DF gradient and frosted shell under v4 tokens were
   neither look; the e2e paint check reads the page colour and the resolved accent. The
   light-glass muted-message promotion (`glass-message.ts`) was removed with it: it only
   existed because muted text failed on the DF frame, and on the flat page every skin's
   own ink clears 4.5:1.
2. **Foundational skins and a detail-page pilot.** Button, Input, Switch, Checkbox, Card,
   Badge on all platforms, and the Button detail page end to end, exercising the kit
   before the showcase is composed from it.
3. **Docs shell.** Navbar pill (hue swatches, scheme and glass switches), grain, scrollbars,
   rail, footer; the hand-off's grain over the flat page (the DF page look itself is
   already retired in Phase 1).
4. **Remaining component skins, section by section:** Controls, Inputs, Navigation,
   Data, Charts, Overlays, Layout, Foundations.
5. **Section pages and the Library landing.** The eight section pages with hero vignettes
   and card grids, built from kit components.
6. **Detail pages for every component.** Prop knobs from an extended `extract-props.ts` (defaults, unions),
   Variants, Sizes, States, Anatomy, Props, Accessibility, Platforms, Usage, Tokens.
7. **Skins and Templates pages.**
8. **Final verification and release.** Lookout design-parity references for every route, `lookout check`
   with the Astra challenger, `verify-fix` on each finding; port `cv-audit.js`'s checks as
   docs-preview parity tests; re-mint visual baselines; native screenshots on iOS and
   Android.
