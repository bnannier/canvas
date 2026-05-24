# @olympusoss/canvas

## 4.0.0

### Major Changes

- a144959: Canvas v3: CSS-first design system.

  Complete rewrite from v2 React component library to a pure CSS design system
  with optional JS utilities. Ships modular CSS files and small
  framework-agnostic helpers.

  Key changes:

  - All components are now CSS classes (no React/framework code)
  - Custom properties are the theming API (HSL channels, shadcn-compatible)
  - CSS layers for specificity control (reset, tokens, base, components, patterns)
  - Light/dark via `.dark` class, glass surface via `data-surface="glass"`,
    density via `data-density="compact|comfy"`
  - 45 component CSS files, 7 token files, 7 pattern files
  - WCAG AA color contrast compliance
  - prefers-reduced-motion and prefers-contrast support
  - Framework-specific components move to dedicated packages
    (canvas-react, canvas-vue, canvas-flux, canvas-react-native)
