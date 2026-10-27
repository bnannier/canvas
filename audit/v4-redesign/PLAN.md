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
    `warning-text` (per scheme) are solved by `src/style/ink-floor.ts`, which walks the
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
- **D8 Motion.** Specified per control and platform: the web skin presses at `scale(.97)`
  unless `steadyPress`; iOS keeps its dim and Android its ripple; switch and segmented
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
