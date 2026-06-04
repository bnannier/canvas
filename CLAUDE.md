# Canvas

Tailwind CSS v4 design system for the Olympus platform. Published as
`@olympusoss/canvas`. The next major (v4.0.0) is the first Tailwind release: a
breaking change from the v3 hand-authored CSS library (pin the v3 tag to
migrate).

Canvas is the platform's Tailwind theme plus a library of components expressed as
Tailwind utility-class markup, plus small framework-agnostic JS helpers. It fills
the role shadcn fills elsewhere, a Tailwind-native component system you compose
from utilities, but it does not depend on or vendor shadcn: the theme and the
components are Canvas's own, built fresh on Tailwind. Canvas aims to be the new
shadcn for the Olympus platform. No React/RN/Vue code lives here. Framework bindings live in downstream packages
(`@olympusoss/canvas-react`, `-react-native`, `-vue`, `-flux`; pattern
`canvas-{framework}`) that depend on Canvas and bake its utility markup into
components. The dependency arrow is one-way: Canvas never references a downstream
package.

## Atomic design

Canvas is organized by the atomic design methodology. Every component is
classified into exactly one level, and the docs (sidebar groups, the `category`
field) reflect that taxonomy. A component is a documented composition of Tailwind
utilities, not a CSS class.

- **Atoms**: indivisible building blocks (button, input, badge, avatar,
  checkbox, icon, tooltip, spinner, kbd, separator).
- **Molecules**: small compositions of atoms (card, alert, form layout, field
  display, stats, media object, stacked list, empty state).
- **Organisms**: complex, self-contained sections (data table, navigation,
  calendar, charts, command palette, overlays, steppers, tabs).

Two higher-order groupings build on those levels:

- **Templates**: full-page layouts composed from organisms/molecules/atoms
  (dashboard, settings, profile, sign-in).
- **Patterns**: cross-cutting concerns layered across every level (accessibility,
  density, glass surface, loading, responsive).

Directive: classify every new component into the correct level before adding it.
The `category` field is `"Atoms" | "Molecules" | "Organisms"`; place the entry in
the matching sidebar group. A full page is a Template, not a component; a
cross-cutting concern is a Pattern, not a component.

## Component docs

Two rules for every component entry in `docs/src/data/`:

- **Examples live in the playground, not in standalone sections.** Each component
  demonstrates all of its variants and states through its playground (controls +
  render), which is the single source of truth. Do not add `sections` examples that
  duplicate what the playground can already show; if a variation is not reachable,
  add a playground control for it rather than a separate example. Reserve `sections`
  for non-example content (anatomy notes) only.
- **A do's-and-don'ts pair for every variant.** Every variant of a component gets its
  own labeled entry in `donts` (name it with the `DontDo.title` field). A single
  blanket do/don't is not enough; cover each variant.

## Architecture

**Tailwind CSS v4 is the engine.** Canvas builds on Tailwind v4's CSS-first
config: `@import "tailwindcss"`, the design tokens in `@theme`, the cascade in
Tailwind's `@layer theme, base, components, utilities`, custom utilities via
`@utility`, custom variants via `@custom-variant`. There is no JS
`tailwind.config`.

**Utilities are the API.** Components are not CSS classes. A component is a
composition of Tailwind utilities applied directly in markup (the shadcn /
Tailwind Plus idiom): a button is
`inline-flex items-center justify-center rounded-md bg-primary px-4 ...`, not a
`.btn`. Canvas ships the theme and the base layer; the canonical markup for each
component lives in the docs data and in the downstream framework packages, not in
component CSS.

**The design language is the theme.** Every visual decision (color, spacing,
type, radius, shadow, motion) is a Tailwind theme token defined in `@theme` as a
CSS custom property, which generates the matching utilities (`bg-primary`,
`rounded-md`, `text-muted-foreground`). Canvas defines its own semantic tokens
(`--color-primary`, `--color-muted-foreground`, `--color-border`, `--color-ring`,
`--radius-md`, ...), built fresh on Tailwind's defaults: not shadcn's set, not
recovered v3 values. Light values live at `:root`; dark overrides under `.dark`,
following Tailwind v4's own CSS-variable dark-mode pattern. Change a token value
and every utility that references it follows.

**A build step is required.** Tailwind scans content and JIT-generates only the
utilities in use, so consumers run Tailwind (the `@tailwindcss/vite` plugin, the
PostCSS plugin, or the CLI) and import Canvas for the theme and base. This
reverses the v3 "no build step" promise on purpose: the Tailwind engine is the
tradeoff for the Tailwind look and the utility API.

**Theming** via theme tokens only (markup never changes, only token values):
light at `:root`, dark via Tailwind's `dark` variant (`.dark` on `<html>`); glass
via `data-surface="glass"` and a `@custom-variant`; density via
`data-density="compact|comfy"`.

**JS utilities** (`src/`): `cn()` for class composition (clsx + tailwind-merge,
so conflicting utilities resolve last-wins), a dark-mode toggle, and token-value
access for native consumers. No framework deps; needs only a DOM.

## File structure
```
styles/
  canvas.css     # entry: @import "tailwindcss"; @import the theme + base; @utility/@custom-variant
  theme.css      # @theme tokens + the shadcn :root/.dark channel variables
  base.css       # @layer base element defaults and reset
src/
  index.ts  cn.ts  theme.ts  tokens.ts
```
Component markup is not CSS. The source of truth for each component's utility
composition is the docs data (`docs/src/data/`) and the downstream framework
packages.

## Naming
- **Theme tokens**: Canvas's own semantic names defined in `@theme` using Tailwind
  namespaces, so they generate semantic utilities: `--color-primary` produces
  `bg-primary`, `--color-muted-foreground` produces `text-muted-foreground`, plus
  `--radius-*`, `--font-*`, `--shadow-*`, `--animate-*`. Fresh, Tailwind-native
  values; no shadcn token set, no recovered v3 values.
- **Utilities**: Tailwind's own (`bg-primary`, `px-4`, `rounded-md`). No Canvas
  component classes, no `canvas-` prefix, no BEM. Semantics live in the token
  names and in downstream component names (`<Button variant="...">`), not in CSS
  classes.
- **Files**: kebab-case. **JS exports**: camelCase functions, PascalCase types.

## Principles
1. Utilities do the work: express components as Tailwind utilities in markup. Drop
   to `@utility`/`@layer`/`@custom-variant` only for what utilities cannot express
   (glass, complex state, keyframes).
2. The theme is the single source of visual truth: never hard-code a color,
   spacing, or radius in markup; use the token-backed utility (`bg-primary`, not
   `bg-[#0a0a0a]`).
3. Build step accepted: consumers run Tailwind. Optimize the developer loop (JIT,
   sub-second rebuilds) rather than pretend there is none.
4. Minimal footprint: Tailwind purges unused utilities; keep the theme lean and
   every token earning its place. Orphan tokens are dead weight.
5. Semantic tokens, visual utilities: name tokens by meaning (`--primary`), let
   the generated utilities be visual (`bg-primary`). Apps express intent through
   downstream component names, not raw utility soup where a named component fits.
6. Platform-neutral: the visual baseline is Tailwind's own design language (its
   palette, spacing, type, radii), which is platform-neutral. Do not borrow iOS-
   or Android-specific idioms (iOS segmented pills, Material ripples,
   platform-named tokens); design every component on its own terms.

## Release & testing
- **Changesets** for versioning. Releases go through CI/CD; never `npm publish`
  locally. v4.0.0 is the first Tailwind release (breaking change from the v3
  hand-authored CSS library; pin the v3 tag to migrate).
- Testing: visual regression (screenshots across themes/viewports), theme-token
  validation (every token defined, no orphans), color-contrast + focus-visible
  a11y, built-CSS size budget on the shipped theme, JS unit tests.

## Consumer contract
Consumers install Tailwind v4, import Canvas for the theme and base, point
Tailwind's `@source` at Canvas's component markup (so the utilities its
components use get generated), and either use a downstream framework package's
components or copy the documented utility markup. Native (RN) reads token values
rather than CSS. Platform-wide visual decisions (a color, a spacing step, a new
token) go in Canvas's theme; framework-specific API decisions go in the
downstream package.

## Toolchain
Tailwind CSS v4 (Lightning CSS under the hood). Docs run the `@tailwindcss/vite`
plugin; the shipped theme builds with the Tailwind CLI or PostCSS. Keep
Changesets and Playwright (visual regression). The v3 token/utility scripts
(`generate-utilities`, `validate-tokens`, `check-size`) are superseded by
Tailwind's own generation and need reworking, not carrying over wholesale.
