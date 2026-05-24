# Migration Guide: v2 to v3

## What Changed

Canvas v2 was a React component library with 80+ components, Tailwind integration,
Radix primitives, Recharts, TanStack Table, TipTap, and other runtime dependencies.

Canvas v3 is a clean break. It is a **pure CSS design system** with optional JS
utilities. There are no React components, no framework code, and no Tailwind.

The dependency arrow reversed: v2 consumers imported React components directly from
Canvas. In v3, framework-specific component libraries are separate packages that
depend on Canvas.

## Architecture Comparison

| Concern | v2 | v3 |
|---|---|---|
| Components | React (JSX/TSX) | CSS classes (plain HTML) |
| Styling | Tailwind utilities | Semantic CSS custom properties |
| Theming | Tailwind config + CSS vars | CSS custom properties only |
| Primitives | Radix UI | None (bring your own) |
| Charts | Recharts | None (bring your own) |
| Tables | TanStack Table | CSS only (`.dt-*` classes) |
| Editor | TipTap | None |
| Framework | React only | Framework-agnostic |
| Build | Required (Tailwind JIT) | None (valid CSS, works directly) |

## Downstream Packages

Framework-specific component libraries now live in dedicated packages:

- `@olympusoss/canvas-react`: React components for web.
- `@olympusoss/canvas-react-native`: React Native components for mobile.
- `@olympusoss/canvas-vue`: Vue components.
- `@olympusoss/canvas-flux`: Flux components.

These packages depend on `@olympusoss/canvas` for tokens and CSS. They wrap Canvas
CSS patterns into framework-specific component APIs.

If your app used v2 React components directly, you will migrate to
`@olympusoss/canvas-react` (or build your own components on top of Canvas CSS).

## Mapping v2 React Imports to v3

### Before (v2)

```tsx
import { Button } from "@olympusoss/canvas";
<Button variant="outline" size="sm">Cancel</Button>
```

### After (v3, plain CSS)

```html
<button class="btn btn-outline btn-sm">Cancel</button>
```

### After (v3, via canvas-react)

```tsx
import { Button } from "@olympusoss/canvas-react";
<Button variant="outline" size="sm">Cancel</Button>
```

## Common Component Mappings

| v2 React Component | v3 CSS Classes |
|---|---|
| `<Button>` | `.btn` + `.btn-default`, `.btn-outline`, etc. |
| `<Input>` | `.input` |
| `<Card>` | `.card`, `.card-header`, `.card-content`, `.card-footer` |
| `<Badge>` | `.badge` + `.badge-default`, `.badge-secondary`, etc. |
| `<Avatar>` | `.avatar` |
| `<Separator>` | `.sep`, `.sep-v` |
| `<Dialog>` | `.dialog-overlay`, `.dialog`, `.dialog-header`, etc. |
| `<Sheet>` | `.sheet-overlay`, `.sheet`, `.sheet-right`, etc. |
| `<Tabs>` | `.tabs-list`, `.tab`, `.tabs-content` |
| `<Alert>` | `.alert` + `.alert-default`, `.alert-destructive`, etc. |
| `<Toast>` / `<Toaster>` | `.toast-viewport`, `.toast`, etc. |
| `<Select>` | `.select` or `.select-trigger` |
| `<Checkbox>` | `.checkbox`, `.checkbox-label` |
| `<Switch>` | `.switch` |
| `<DataTable>` | `.dt-wrap`, `.dt-table`, `.dt-toolbar`, etc. |
| `<Sidebar>` | `.sidebar`, `.sidebar-item`, etc. |
| `<Tooltip>` | `.tooltip`, `.tooltip-arrow` |
| `<Popover>` | `.popover` |
| `<DropdownMenu>` | `.dropdown`, `.dropdown-item` |
| `<Breadcrumb>` | `.breadcrumb`, `.breadcrumb-item` |
| `<Pagination>` | `.pagination`, `.page-btn` |
| `<Skeleton>` | `.skeleton`, `.skeleton-text`, `.skeleton-circle` |
| `<Spinner>` | `.spinner` |
| `<Command>` | `.command-dialog`, `.command-input`, `.command-item` |

## Theming Migration

### v2

Theming used Tailwind config extensions and `tailwind.config.js` color mappings.
Dark mode was via Tailwind's `dark:` variant.

### v3

Theming uses CSS custom properties exclusively. Dark mode is the `.dark` class on
`<html>`. Glass surface and density are HTML data attributes.

```html
<html class="dark" data-surface="glass" data-density="compact">
```

See [theming.md](./theming.md) for full details.

## What You Need to Do

1. **Choose your path.** Either adopt a downstream package (`canvas-react`, etc.)
   or build components directly on Canvas CSS classes.
2. **Replace imports.** Swap `@olympusoss/canvas` React imports for CSS class usage
   or the new downstream package.
3. **Remove Tailwind.** v3 does not use Tailwind. Remove Canvas-related Tailwind
   config and replace utility classes with Canvas custom properties or component
   classes.
4. **Import CSS.** Add `@import "@olympusoss/canvas/styles/canvas.css"` to your
   entry point, or import individual files.
5. **Update theming.** Replace Tailwind dark-mode config with the `.dark` class
   and data attributes.
6. **Handle primitives yourself.** v3 has no Radix dependency. If you need
   accessible primitives (focus trapping, ARIA, keyboard nav), bring your own or
   use a downstream package that provides them.

## Pinning v2

The v2 branch/tag remains available. If you need time to migrate, pin your
dependency to the last v2 release.
