## How to build with Canvas

Canvas is a React Native kit rendered on the web through React Native Web. Every
component reads its look from boolean props; build screens by composing them.

### Wrap the app once

```jsx
const { ThemeProvider, OverlayProvider, Container, Column, Row, Typography, Card, Button, Input, Icon } = window.Canvas;

<ThemeProvider dark fonts={{
  sans: '"Instrument Sans", system-ui, sans-serif',
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
}}>
  <OverlayProvider>
    <Container lg>
      <Column comfortable>
        <Typography h2>Workspace</Typography>
        <Card>
          <Column snug>
            <Input placeholder="Project name" />
            <Row tight alignCenter>
              <Button primary iconLeft={<Icon plus />}>Create</Button>
              <Button ghost>Cancel</Button>
            </Row>
          </Column>
        </Card>
      </Column>
    </Container>
  </OverlayProvider>
</ThemeProvider>
```

- `ThemeProvider` takes the scheme (`dark` or `light`; omit both to follow the OS), the
  accent palette (`cyan`, `mint`, `rose`, `amber`; omit for violet) and the surface
  mode (`glass` or `solid`). Always pass `fonts` as above, or text falls back to the
  system face.
- Mount one `OverlayProvider` inside `ThemeProvider`, outside scrolling content, so
  Dropdown, Select, Autocomplete and Popover cards get viewport bounds.

### Style with boolean props, never `style`

- One prop per choice, named for its meaning: `<Button primary large>`,
  `<Button destructive>`, `<Badge success>`, `<Card raised>`. There are no
  `variant="..."` or `size="..."` strings, and no raw `style` overrides for color,
  spacing, radius or type. If a look is missing, pick the nearest existing prop.
- Axes: intent (`primary`, `secondary`, `destructive`, `ghost`, `outline`, `link`),
  size (`small`, `large`), density (`compact`, `comfortable`, on the components that
  offer it), plus stackable state
  (`loading`, `disabled`, `block`).
- Labels go through the component: `<Checkbox description="...">Title</Checkbox>`,
  never a Checkbox beside a hand-made Typography.

### Layout

- `Row` and `Column` set the gap with `tight`, `snug`, `cozy`, `comfortable`,
  `relaxed`, `loose` or `spacious`; alignment with `alignStart`, `alignCenter`,
  `alignEnd` and `between`; `wrap` wraps, `stacks` turns a Row into a column at
  narrow widths, `fill` takes the remaining space.
- Components fill or hug their parent and never take a width. Cap a measure with a
  `Container` step (`xs`, `sm`, `md`, `lg`, `xl`, `page`), split a Row into columns
  with `Column span={1..12}` children, and use `Grid` for equal tiles.
- Typography roles are booleans: `display`, `h1` to `h5`, `lead`, `body`, `small`,
  `caption`, `tiny`, `code`, plus `muted`, `semibold`, `bold`.
- Icons are boolean glyph names: `<Icon shield />`, `<Icon circleCheck success />`.

### Where the truth lives

- Each component's `.prompt.md` (examples and props) and `.d.ts` (the full API).
- `guidelines/DESIGN.md` (the "Light as material" language) and
  `guidelines/USAGE.md` (setup, overlays, responsiveness).
- Tokens are CSS custom properties in `_ds_bundle.css` (`--background`,
  `--foreground`, `--primary`, `--muted-foreground`, `--border`, `--radius`,
  `--font-sans`); components already apply them, so a design rarely needs them.
