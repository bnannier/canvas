# Canvas

CSS-first design system for the Olympus platform. Published as
`@olympusoss/canvas` (v3.0.0+).

Pure CSS plus optional framework-agnostic JS helpers. No React/RN/Vue/etc.
code. Framework bindings live in downstream packages (`@olympusoss/canvas-react`,
`-react-native`, `-vue`, `-flux`; pattern `canvas-{framework}`) that depend on
Canvas. The dependency arrow is one-way: Canvas never references a downstream
package.

## Atomic design

Canvas is organized by the atomic design methodology. Every component is
classified into exactly one level, and the docs (sidebar groups, the `category`
field) reflect that taxonomy:

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

## Architecture

**Custom properties are the API.** Every visual decision (color, spacing,
type, radius, shadow, motion) is a CSS custom property; components reference
properties, never raw values.

**No preprocessors, no build step for consumers.** Author plain,
spec-compliant CSS: custom properties, `@layer`, `@container`, `color-mix()`,
`light-dark()`. Each concern ships as its own modular CSS file; consumers
import only what they use (`canvas.css` is the all-in-one entry).

**CSS layers** control the cascade, declared in this order:
`@layer canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns;`
reset = browser normalization · tokens = custom-property defs · base = element
defaults · components = component classes · patterns = cross-cutting
(backdrops, glass, density, focus, scrollbar).

**Theming** via custom properties only (components never change, only token
values): light at `:root`, dark via `.dark` on `<html>`; glass via
`data-surface="glass"`; density via `data-density="compact|comfy"`.

**JS utilities** (`src/`): theme switching, token access, `cn()` class
composition. No framework deps; needs only a DOM.

## File structure
```
styles/
  canvas.css            # all-in-one entry (@imports everything)
  reset.css  base.css
  tokens/      colors, typography, radius, motion
  atoms/       button, input, badge, avatar, checkbox, icon, tooltip, spinner,
               kbd, separator, ... (single-purpose primitives)
  molecules/   card, alert, form, field, stat-card, section-card, page-header,
               empty-state, toast, code-block (small compositions of atoms)
  organisms/   data-table, sidebar, topbar, app-shell, dialog, sheet, command,
               calendar, stepper, tabs, filter-panel, row-menu (complex surfaces)
  patterns/    backdrops, glass, density, focus, scrollbar
src/
  index.ts  theme.ts  tokens.ts  cn.ts
```

## Naming
- **Custom properties**: shadcn-compatible flat names, no `canvas-` prefix.
  Colors as HSL channels (`--background`, `--primary`, `--muted-foreground`,
  `--ring`, `--chart-1`, `--sidebar-background`); scales (`--radius-sm`,
  `--font-sans`); animations (`--animate-modal-in`).
- **Classes**: short flat names, no prefix, no BEM. Components `.btn` `.card`
  `.sidebar`; variants `.btn-outline` `.btn-sm`; sub-elements `.card-header`
  `.stat-card-label`.
- **Files**: kebab-case matching the component/concern. **JS exports**:
  camelCase functions, PascalCase types.

## Principles
1. CSS does the work: if it can be done in CSS, do it in CSS, not JS.
2. No build step required for consumers; valid spec-compliant CSS only.
3. Progressive enhancement: modern CSS, degrade gracefully, document support.
4. Minimal footprint: every token/class/file earns its place; orphaned tokens
   are dead weight.
5. Semantic over visual: name by meaning (`--primary`), not appearance
   (`--blue-500`).

## Release & testing
- **Changesets** for versioning. Releases go through CI/CD; never
  `npm publish` locally. v3.0.0 is the first CSS-first release (breaking change
  from the v2 React component library; pin the v2 tag to migrate).
- Testing strategy: visual regression (screenshots across themes/viewports),
  token validation (every token defined, no orphans), per-module size budget,
  color-contrast + focus-visible a11y, JS unit tests.

## Consumer contract
Downstream packages depend on Canvas, import its tokens/CSS (or read token
values for native), and wrap Canvas CSS patterns in framework components.
End-user apps (Athena, Hera, Site) usually consume a downstream package but may
import Canvas directly. Platform-wide visual decisions (a color, a spacing
scale, a new semantic token) go in Canvas; framework-specific API decisions go
in the downstream package.

## Toolchain
Being rethought from scratch; prioritize sub-second CSS feedback, CSS
correctness/linting, per-module size tracking, visual regression. Do NOT carry
over v2 tooling assumptions (Biome, Vitest) without explicit discussion.
