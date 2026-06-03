# Canvas v2 → v3: verified architectural deep-dive

Companion to [V2-V3-COMPONENT-MATRIX.md](V2-V3-COMPONENT-MATRIX.md). Everything below
is measured from source: the **v2.20.2** git tag vs the current **v3 (`3.2.1`)** working
tree. Commands and counts are reproducible.

## TL;DR — the real difference is not "fewer components," it's a total inversion

| Dimension | v2.20.2 | v3 (3.2.1) | Δ |
| --- | --- | --- | --- |
| Runtime dependencies | **66** | **0** | −66 |
| Peer dependencies | **6** | **0** | −6 |
| Public JS exports | **117** (+ 6 hooks) | **13** (0 components) | −104 |
| Component source | **131** TS/TSX files, **14,869** LOC | **0** components | — |
| Shipped CSS | **5** files | **68** files, **4,096** LOC | +63 files |
| Hand-authored CSS classes | ~0 (Tailwind utilities inline) | **385** | +385 |
| Design tokens (CSS custom props) | **67** (1 file) | **96** (7 modular files) | +29 |
| JS shipped | a React component library | **89 LOC** of DOM helpers | −99.4% |

v2 was a **React component library**: 14.9k lines of TSX wrapping 72 third-party
packages, styled with Tailwind + CVA. v3 is a **CSS-first design system**: 4.1k lines
of modular CSS + 89 lines of framework-agnostic JS, **zero** runtime deps. Components
went from *shipped code* to *class contracts*.

## 1. Dependencies — v3 deletes the entire supply chain (the headline)

v2's `package.json` declared **66 runtime + 6 peer = 72 external packages**. v3 declares
**none** (devDeps are just `@changesets/cli`, `@playwright/test`, `typescript`).

v2's runtime deps, by cluster:

| Cluster | Count | Packages |
| --- | ---: | --- |
| Radix UI primitives | 26 | `@radix-ui/react-{dialog, dropdown-menu, select, popover, tooltip, switch, checkbox, radio-group, slider, progress, accordion, collapsible, tabs, toggle, toggle-group, context-menu, hover-card, menubar, navigation-menu, scroll-area, separator, label, avatar, aspect-ratio, alert-dialog, slot}` |
| CodeMirror | 10 | `@codemirror/{view, state, commands, language, lang-css, lang-html, lang-javascript, lang-json, lang-markdown}` + `codemirror` |
| Tiptap (rich text) | 5 | `@tiptap/{core, react, starter-kit, extension-link, extension-placeholder}` |
| Charts / maps | 5 | `recharts`, `leaflet`, `react-leaflet`, `d3-geo`, `react-simple-maps` |
| Forms | 4 | `react-hook-form`, `zod`, `@hookform/resolvers`, (`@rjsf/*` peer) |
| Misc UI | ~16 | `cmdk`, `sonner`, `vaul`, `embla-carousel-react`, `react-day-picker`, `react-grid-layout`, `react-resizable-panels`, `@tanstack/react-table`, `input-otp`, `next-themes`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `date-fns`, `dompurify`, `marked` |

### The key insight: dropped components *are* the eliminated dependencies

The components that vanished in v3 weren't arbitrary cuts. Almost every one was a thin
React wrapper around a heavy JS package that CSS fundamentally cannot replace:

| v2 component (now gone / out of scope) | Was wrapping |
| --- | --- |
| CodeEditor | `@codemirror/*` (10) |
| RichTextEditor, MarkdownEditor | `@tiptap/*` (5) + `marked` + `dompurify` |
| SchemaForm | `@rjsf/*` + `react-hook-form` + `zod` |
| Charts (12 types) | `recharts` |
| WorldHeatMap | `leaflet` + `react-leaflet` + `d3-geo` + `react-simple-maps` |
| Carousel | `embla-carousel-react` |
| Resizable | `react-resizable-panels` |
| DashboardGrid | `react-grid-layout` |
| InputOTP | `input-otp` |
| PhoneInput | `libphonenumber-js` |
| ThemeProvider | `next-themes` |

Conversely, the **26 Radix primitives** backed the interactive atoms/organisms that
*survived* (dialog, dropdown, select, popover, tooltip, switch, checkbox, radio, tabs…).
v3 reimplemented those as pure CSS, which is why they're "Carried over" in the matrix
while the editor/data-grid/maps wrappers are "Out of scope." **The matrix's
out-of-scope column and this dependency-deletion list are the same event.**

## 2. JS API surface — 117 exports → 13

- **v2** `src/index.ts`: **117** exports (every component + its `*Variants` CVA helper +
  types) plus **6 hooks**: `useChart`, `useFormField`, `useIsMobile`,
  `usePortalContainer`, `useSidebar`, `useTheme`. Plus `src/native.ts` for React Native
  token consumption.
- **v3** `src/` (4 files, 89 LOC): **13** exports, all framework-agnostic DOM helpers:
  - `cn` (class composition)
  - `token`, `hsl` (read token values)
  - `getTheme` / `setTheme` / `toggleTheme`
  - `getSurface` / `setSurface` (glass)
  - `getDensity` / `setDensity`
  - types `Theme`, `Surface`, `Density`

No components, no hooks, no React. The `useTheme`/`next-themes` machinery collapsed into
three `setTheme`-style functions that toggle a `.dark` class.

## 3. Tokens — fewer ad-hoc colors, formalized scales

v2 had **67** custom properties in a single `styles/tokens.css` (plus JS mirrors in
`src/tokens/{colors,spacing,typography}.ts`). v3 has **96** unique across **7 modular
files** (`colors` 92 decls incl. light+dark, `spacing` 15, `shadows` 10, `motion` 8,
`z-index` 8, `radius` 6, `typography` 2).

**Added in v3 — whole scales that v2 only had implicitly via Tailwind:**
- Spacing scale: `--space-0 … --space-16` (+ `--space-px`, half-steps)
- Radius scale: `--radius-sm/md/lg/xl/2xl/full`
- Z-index scale: `--z-base/sticky/dropdown/sidebar/overlay/modal/popover/toast`
- Motion: `--animate-{fade-in,slide-in,modal-in,toast-in}`, `--duration-{fast,normal,slow}`, `--ease-out`
- Semantic state colors: `--color-{success,warning,info}`, `--{success,warning,info,error}-{bg,fg}`
- Focus: `--focus-ring-width`, `--focus-ring-offset`
- Decorative: `--brand-gradient`, `--brand-blue-400/700`, `--orb-{cyan,indigo,violet}`, `--shadow-elevated`

**Removed in v3:**
- `--tracking-*` (letter-spacing tokens) — dropped entirely
- `--stat-{amber,blue,purple,success,destructive}` — consolidated into `--chart-1…5`
- `--chart-6` — palette trimmed to 5
- `--color-*` mirrors and `--sidebar` shorthand — these were Tailwind v4 `@theme`
  auto-generated aliases; gone with Tailwind
- `--shadow-2xs`, `--shadow-xl` — shadow scale re-cut

## 4. Component depth — folded ≠ degraded

Spot-checked that "carried/folded" components kept their variant depth as CSS modifiers:

| Component | v2 (CVA props) | v3 (CSS classes) | Verdict |
| --- | --- | --- | --- |
| Button | 6 variants (`default, destructive, outline, secondary, ghost, link`) × 4 sizes (`default, sm, lg, icon`) | `.btn` + `.btn-{default,destructive,outline,secondary,ghost,link}` + `.btn-{sm,lg,icon}` | **Exact parity** |
| Badge | 4 variants (`default, secondary, destructive, outline`) | `.badge-{default,secondary,destructive,outline}` **+ `.status-badge`** | **v3 superset** (absorbed StatusBadge) |

So consolidation in v3 is genuine re-implementation, not a stub.

## 5. Icons — library bundled → styling contract

A real, easy-to-miss difference:
- **v2**: `import { icons } from "lucide-react"` and `iconNames = Object.keys(icons)` —
  the **entire Lucide set** (~1,500 icons) shipped as React components via the
  `lucide-react` dependency.
- **v3**: ships **no icon library**. `icon.css` is a styling contract — it sizes and
  sets stroke-width on any `[data-lucide]` SVG you provide. The "90+ icons" referenced in
  the docs are inline-SVG *examples*, not a shipped sprite. Consumers bring their own SVG.

(Worth noting in the matrix: v3 "Icons" is a contract, not a set.)

## 6. CSS surface — 385 classes across a 5-layer cascade

v3 ships **385 unique classes**; v2 shipped ~none (styling lived in Tailwind utilities
written inline in TSX + CVA strings). Distribution:

| Layer | Classes | Note |
| --- | ---: | --- |
| utilities | 146 | the Tailwind replacement (flex, grid, gap, display, sizing, position) |
| atoms | 98 | |
| organisms | 89 | |
| molecules | 54 | |
| patterns | 45 | backdrops, glass, density, focus, scrollbar, high-contrast, reduced-motion |
| tokens | 2 | |

The **utilities layer (146 classes)** is notable: v3 had to re-create the slice of
Tailwind it actually used (`.flex-col`, `.gap-y-*`, `.grid`, `.items-center`, …) as
hand-authored classes, since Tailwind is gone. This is where v2 atoms like **FlexBox**
and **Section** landed.

## Bottom line

The "v2 had a lot v3 doesn't" framing is really three distinct events:
1. **72 dependencies deleted** → the wrapper components around them (editors, data-grid,
   maps, schema-forms, carousel, OTP, phone) necessarily went with them. Expected to
   reappear in downstream `canvas-react`, not in the CSS core.
2. **The React layer deleted** → 117 component exports + 6 hooks became 13 DOM helpers.
3. **Tailwind deleted** → its utilities were re-authored as a 146-class utilities layer,
   and the token system was formalized into explicit scales (+29 tokens).

What's left that's a *true* product gap (in-scope, CSS-feasible, just absent) is the
short list from the matrix: **Accordion, Collapsible, Slider, Progress, InputOTP,
PhoneInput, SecretField, Terminal, ActionBar, AnimatedBackground, Menubar, Carousel,
DashboardGrid, BrandMark, BrandLockup** — 15 items, several of which may be deliberate.
