# Handoff: Canvas v4.0.0 — component library redesign

## Overview
A redesign of **Canvas** (`@nannier/canvas`, repo `bnannier/canvas`, currently published as 3.12.1) branded **v4.0.0**: a universal React Native UI kit whose one component API renders natively on iOS, Android and the web. This bundle covers all **107 components** in eight sections, a per-component detail page, platform skins, and 18 full app templates. The design direction is "light as material": dark-first glass surfaces, one tunable accent hue ("ion"), spring motion, and three platform skins (Web, iOS HIG, Android Material 3).

## About the design files
Everything here is a **design reference built in HTML**: prototypes showing the intended look and behaviour, **not production code to copy**. The job is to recreate these designs **inside the Canvas codebase** with its existing patterns: the `*.shared.tsx` shells, the per-platform `*.styles.ts` skins (`webSkin` / `iosSkin` / `androidSkin`), the tokens in `src/style/tokens.ts`, and the docs site in `docs/`. Where the prototype and the repo disagree on an API, **the repo wins**. The prototype only draws what the repo's props already describe.

Open any `.dc.html` file directly in a browser. The pages need the sibling `.js` files and `docs/public/` (avatars, favicon) next to them. They load Google Fonts and `qrcode-generator` from a CDN.

## Fidelity
**High fidelity.** Final colours, type, spacing, radii, shadows, motion and interaction states. Recreate pixel-accurately, expressing every value through the repo's token and skin system rather than hard-coding it.

## Screens / views
| File | Purpose |
| --- | --- |
| `Canvas v4.0.0 Library.dc.html` | Landing page: hero, the "light as material" direction, and an index of all 107 exports by section. |
| `… Foundations / Layout / Controls / Inputs / Navigation / Data / Charts / Overlays .dc.html` | One page per section. Each has a looping animated hero, a sticky left rail (`CanvasRail.dc.html`, ≥760px only) filtered to that section, and a grid of live component cards. Each card's ↗ opens the detail page. |
| `… Skins.dc.html` | The same controls side by side as Web, iOS (capsule, 44pt, SF Pro) and Android (Material 3 stadium, 48dp, Roboto). |
| `… Templates.dc.html` | 18 full interactive screens (sign-in, sign-up, onboarding, dashboard, activity, identities, team, inbox, chat, calendar, kanban, detail, profile, settings, billing, pricing, errors, empty states), with a Web / iOS / Android device-frame switch. |
| `… Component.dc.html#<slug>` | Detail page for every component, e.g. `#button`. Sections: Playground (prop knobs, platform switch, generated JSX), Variants (every example from `src/**/<name>.md`), Sizes, States, Anatomy (numbered markers), Props (from `<name>.shared.tsx`), Accessibility + keyboard, Platform skins, Usage, Tokens. |
| `… Variant Audit.dc.html` | QA page. Re-renders every Variants example and playground control on all three platforms and lists any mismatch between code and picture. It currently reports **0 of 556**. |
| `… Specimen.dc.html` | The earlier direction sheet. Superseded; kept for reference. |

### Shared chrome (every page)
- **Navbar:** a floating glass pill, sticky top, 14px from the top. Background `--gl` with `backdrop-filter: blur(20px) saturate(1.6)`, border `--ln2`, shadow `--sh-md`, radius 999, padding 5. It holds the Canvas mark (`docs/public/favicon.svg`, 20px) with "Canvas" in 600 14px Bricolage Grotesque, then the section links (500 13px, 32px tall, the active link on `--sf3`), then five accent-hue swatches (16px circles), a Dark/Light segmented switch (spring thumb, 0.45s `cubic-bezier(.34,1.56,.64,1)`), and a Glass switch.
- **Glass off:** sets `--bf: none` and `--gl: var(--sf2)`, so every pane becomes solid.
- **Grain:** a fixed noise overlay at `--grain-o` (0.07 dark, 0.05 light).
- **Scrollbars:** thin everywhere. The thumb is `--sb` (white 18% dark, ink 20% light) and goes to `--sb-h` on hover. The track is transparent.
- **Rail (CanvasRail):** 200px column, sticky at top 76px, filter box 36px tall. Items are 30px, 500 13px; the active item is `--ion-soft` / `--ion-tx`.

## Interactions & behaviour
- **Accent hue** (`--hue`: 285 violet, 205 cyan, 165 mint, 20 rose, 75 amber) repaints the whole page, because every accent is `oklch(L C var(--hue))`.
- **Scheme** toggles the `[data-scheme="light"]` token set.
- **Platform switch** on the detail page re-skins the playground, variants, sizes, states and anatomy. Each skin follows that component's `*.styles.ts`: iOS takes the `iosSkin` anatomy, Android the `androidSkin` anatomy. Examples: iOS radio is a checkmark list; iOS checkbox is a switch; Android inputs are M3 filled fields with a floating label; iOS stepper is a 32pt capsule; Android slider is the Expressive 16dp split track with a 4×44 handle.
- **Previews are code-driven.** The JSX shown under every example is exactly what renders: children, data arrays, flags and starting state (`default*`) all apply. Overlays (Dialog, Drawer, Sheet, Popover, Dropdown, RowMenu) preview their opened state under the trigger unless the code says `open={false}`. Collapsibles stay closed unless opened. Tooltips show only when `open`.
- **Motion:**
  - Section heroes loop: weight and colour shifts, reflow, tab sliding, dialog and toast, chart draw.
  - Reveal uses `cvRev`: 0.7s (brisk 0.35s), `cubic-bezier(.2,.8,.2,1)`, 16px travel (pronounced 36px).
  - Press feedback is `scale(.97)` unless `steadyPress`.
  - Everything honours Reduce Motion.
- **Responsive:**
  - The rail hides below 760px.
  - `responsive` Tabs collapse to a picker below 760px, and `responsive` FilterPanel collapses to a "Filters" button.
  - Fixed preview widths always carry `max-width: 100%`.
- **Fields** are real inputs carrying React Native Web's mapping of `keyboardType`, `autoComplete`, `autoCapitalize`, `textContentType`, `secureTextEntry` and `maxLength`.
- **Accessibility:** `accessibilityLabel`, `accessibilityHint` and `accessibilityRole` map to `aria-label`, `aria-description` and `role`. `testID` maps to `data-testid`.

## State management (prototype)
- **Page level:** `scheme`, `hue`, `glass`, plus the rail filter query.
- **Detail page:** `slug` (from the URL hash), knob values `kv`, platform `pf`, and the open sub-component prop tables.
- **Templates:** per-screen local state such as the sign-in mode, onboarding step, kanban lanes, chat drafts and settings toggles.

There is no data fetching; all content comes from `canvas-docs.js`, which is extracted from the repo docs.

## Design tokens (dark default; light overrides second)
**Surfaces**

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#0a0a0f` | `#f2f2f7` |
| `--bg2` | `#0e0e15` | `#fafafd` |
| `--sf` | `#12121a` | `#ffffff` |
| `--sf2` | `#171720` | `#ffffff` |
| `--sf3` | `#1e1e29` | `#f1f1f6` |
| `--sf4` | `#282836` | `#e4e4ee` |
| `--ln` | `rgba(255,255,255,.08)` | `rgba(17,17,24,.08)` |
| `--ln2` | `rgba(255,255,255,.16)` | `rgba(17,17,24,.16)` |

**Text**

| Token | Dark | Light |
| --- | --- | --- |
| `--tx` | `#f4f4f8` | `#111118` |
| `--tx2` | `#a4a4b6` | `#5a5a70` |
| `--tx3` | `#7f7f93` | `#6c6c82` |

**Accent ("ion")**

| Token | Dark | Light |
| --- | --- | --- |
| `--ion` | `oklch(.74 .17 hue)` | `oklch(.5 .22 hue)` |
| `--ion-tx` | `oklch(.8 .14 hue)` | `oklch(.47 .2 hue)` |
| `--ion-fg` | `#0a0a0f` | `#ffffff` |

- `--ion-soft`: the accent at 16% opacity (10% light).
- `--ion-ring`: the accent at 35% (28% light).
- `--ion-glow`: the accent at 50% (40% light).

**Chart series:** `--c1`…`--c8`
- `--c1` is `--ion`.
- `--c2` cyan, `oklch(.82 .13 205)`.
- `--c3` mint, `oklch(.85 .15 165)`.
- `--c4`…`--c8`: `oklch(.82 .14 75)`, `oklch(.72 .17 20)`, `oklch(.72 .14 255)`, `oklch(.74 .16 330)`, `oklch(.78 .1 125)`.

**Status**

| Token | Dark | Light |
| --- | --- | --- |
| `--ok` | `#3ddc97` | `#0b7a53` |
| `--warn` | `#f6b84c` | `#a55d00` |
| `--bad` | `#ff6b7a` | `#d62a4b` |

Each has a `-soft` tint: 14% dark, 10% light.

**Glass:** `--gl` is `rgba(18,18,26,.62)` dark, `rgba(255,255,255,.62)` light. `--bf` is `blur(20px) saturate(1.6)`. `--scrim` is `rgba(5,5,10,.55)` dark, `rgba(17,17,24,.3)` light.

**Shadows (dark)**
- `--sh-sm`: `inset 0 1px 0 rgba(255,255,255,.1), 0 1px 2px rgba(0,0,0,.5)`
- `--sh-md`: `… , 0 12px 32px -10px rgba(0,0,0,.7)`
- `--sh-lg`: `… , 0 30px 80px -16px rgba(0,0,0,.8)`

**Shadows (light)**
- `--sh-sm`: `0 1px 2px rgba(17,17,24,.05), 0 0 0 1px rgba(17,17,24,.03)`
- `--sh-md`: `0 12px 32px -10px rgba(17,17,24,.16), …`
- `--sh-lg`: `0 30px 80px -16px rgba(17,17,24,.25), …`

**Type**
- Display: Bricolage Grotesque 300–800.
- UI: Instrument Sans 400–700.
- Mono: JetBrains Mono 400–600.
- Platform faces: SF Pro on iOS, Roboto on Android.
- Scale:

| Style | Size / line height | Weight | Tracking |
| --- | --- | --- | --- |
| display | 56/1 | 500 | −.04em |
| h1 | 44/1.05 | — | — |
| h2 | 34/1.1 | — | — |
| h3 | 26/1.15 | — | — |
| h4 | 21/1.2 | — | — |
| h5 | 17/1.3 | 600 | — |
| lead | 19/1.5 | — | — |
| body | 15/1.55 | — | — |
| small | 13/1.5 | — | — |
| caption | 12/1.45 | — | — |
| eyebrow | 11 mono, uppercase | — | .1em |

**Radii per platform** (from `src/style/tokens.ts` shape)

| Platform | control | field | card | dialog |
| --- | --- | --- | --- | --- |
| Web | 10 | 10 | 16 | 20 |
| iOS | 999 | 8 | 12 | 22 (sheet top) |
| Android | 999 | 4 | 12 | 28 |

**Heights:** web control 40, iOS 50 (field 44), Android 40 (field 56).

**Spacing (Row / Column gap scale, `layout.styles.ts`):** flush 0 · tight 4 · snug 8 (default) · cozy 12 · relaxed 16 · loose 24. In-between steps: fine 3, dense 5, compact 6, close 7, nested 9, comfortable 10, balanced 11, roomy 14, airy 18, spacious 20, generous 22, section 26, panel 28, page 30. Padding: padTight 8, pad 16, padLoose 24.

**Width steps:** xxxs 192 · xxs 256 · xs 320 · sm 384 · md 448 · lg 512 · xl 576 · xxl 672 · xxxl 768 · wide 896 · wider 1024 · widest 1152 · page 1280.

## Assets
- `docs/public/favicon.svg`: the Canvas "C" mark.
- `docs/public/*.jpg`: avatar portraits (Ada Lovelace, Grace Hopper, Kira Tanaka, Noor Park, Marcus Allen, Liang Bao).
- Icons are the kit's own Lucide set from `src/atoms/icon/icon.glyphs.ts` (1.75 stroke), inlined in `canvas-assets.js` as `<cv-icon>`.
- The world map is Natural Earth, from `src/charts/geo-map/geo-map.world.ts`, as `<cv-world>`.

## Files
- **Pages:** the `Canvas v4.0.0 *.dc.html` files and `CanvasRail.dc.html`. `support.js` is the prototype runtime and is not needed in the real implementation.
- **Data:** `canvas-docs.js` holds every component's props, variants, a11y notes and usage, extracted from `src/**/<name>.md` and `<name>.shared.tsx`. `canvas-rail-data.js` is the rail index.
- **Component renderers:** these are the best reference for exact per-platform measurements.

| File | What it holds |
| --- | --- |
| `cv-kit.js` | Base helpers and platform tokens |
| `cv-kit-controls.js` | Foundations, layout and controls |
| `cv-kit-inputs.js` | Inputs and navigation |
| `cv-kit-data.js` | Surfaces and data |
| `cv-kit-charts.js` | Charts |
| `cv-kit-overlays.js` | Overlays and feedback |
| `cv-kit-platform.js` | iOS and Android anatomy |
| `cv-kit-code.js` … `cv-kit-code8.js` | Code-driven rendering: how each real prop draws, adapters, sub-components (AvatarMenu, Card parts, FormSection, Chat pieces, DropZone…), behaviour props, states and anatomy |

- **Prototype machinery:**
  - `cv-jsx.js` is the snippet compiler; it is not needed in the product.
  - `cv-audit.js` is the audit behind the Variant Audit page. It doubles as a spec for docs-preview parity tests.
  - `canvas-assets.js` holds the icons, map and QR code.
  - `canvas-hero.js` holds the section hero animations.

## Suggested order for Claude Code
1. Tokens: add the v4.0.0 dark and light sets, the hue-driven accent and glass to `src/style/tokens.ts` and the theme.
2. Shared chrome in the docs site: navbar, rail, hue, scheme and glass toggles.
3. Component skins, section by section. Compare each against its card and its detail page on all three platforms.
4. The detail-page template: playground, variants, sizes, states, anatomy and props.
5. Templates.
6. Port `cv-audit.js`'s checks into the repo's test or e2e setup so docs previews stay in sync with their code.
