# Swatch

A color sample: a filled rounded block with the token's name and value beneath
it, the anatomy a design-system color sheet repeats down a page. Swatch owns the
whole lockup, so a sheet never sets a bare block next to a hand-built text
column and drifts row to row.

Pass a live theme token as `color` and the sample follows the active scheme; a
hairline edge keeps a white or near-black sample visible on the surface behind
it. The chip is 48px at a 12px corner (32 `small`, 72 `large`, and 20 `tiny`,
the disc of a token Chip), the name a 13px line and the value lines 11px mono
in the subtle ink; the lockup also comes as a `circle`, `inline` (the label
beside the block), or as a `block` (a full-width ramp bar). `ring` draws the
edge as a 1px inset ring in the field border instead of the hairline, the token
chip's swatch. `selected` marks the chosen sample with the selection ring, a
2px gap in the page color and then a 2px accent band, and adds "selected" to
its accessible name. `decorative` hides a sample from assistive tech when text
beside it already names it (a theme choice's disc before its label), so the
name is read once.

A palette picker takes one of the kit's five accent palettes, `violet`, `cyan`,
`mint`, `rose` or `amber` (ThemeProvider's precedence: cyan, mint, rose, amber,
violet), with `selected` and `onPress`. It is a 16px disc of the palette's hue,
the same in both schemes, and a radio named for its palette ("Violet"). The
palette in force wears the selection ring, a 2px gap in the card color and then
a 2px muted-foreground band; the others draw none. On the web a hovered disc
grows to 1.25 times its size. A size boolean sizes the disc to that sample edge
(`small` is a 32px disc, the size a form's hue choice takes). Put the pickers in
a `radiogroup` so the set reads as one choice. A plain sample still uses `color`.

The section page's samples come as forms and lockups of the same component. `tile` is
the labelled colour tile, the parent's width and 64 px tall (40 `small`), its name set
inside the fill on one line (ellipsized where it outgrows the tile, its accessible name
whole) in the 11 px code face at an 8 px inset, at the foot (centred `small`),
in the `ink` it is given. `bar` is a colour bar, the parent's width at 26 px and a 7 px
corner. `steps` takes a list of colours in place of `color` and draws one bar of them,
flush and clipped at a 10 px corner at the size's height; `segmented` stands them 4 px
apart in a 28 px bar, each at a 3 px corner but for the bar's two outer ends at 7. The
form precedence is `tile` > `bar` > `circle`, and a `steps` list wins over all three.
`fluid` makes the chip's edge the parent's width, held 1:1; `glow` lays the fill's own
light under the chip; `centered` centres the label column 10 px under the chip; `bare`
drops the resting edge from a fill that needs none; and `compact` is the mono lockup, the
name 500 12 px and the value 400 10 px in the code face, each on one line (ellipsized in a
narrow column), 6 px apart and 6 px under a 56 px `block`.

## Usage

```tsx
<Swatch color={tokens.primary} value="--primary">
  primary
</Swatch>
```

## Variants

### Sizes

```tsx
<Row>
  <Swatch tiny color={tokens.info}>info</Swatch>
  <Swatch small color={tokens.primary}>primary</Swatch>
  <Swatch color={tokens.success}>success</Swatch>
  <Swatch large color={tokens.destructive}>destructive</Swatch>
</Row>
```

### Circle

```tsx
<Swatch circle color={tokens.primary}>primary</Swatch>
```

### Ring

The token chip's swatch: a 20px disc edged by a 1px inset ring.

```tsx
<Row snug alignCenter>
  <Swatch tiny ring circle color={tokens.card} accessibilityLabel="card" />
  <Swatch tiny ring circle color={tokens.primary} accessibilityLabel="primary" />
  <Swatch tiny ring circle color={tokens.background} accessibilityLabel="background" />
</Row>
```

### Inline

```tsx
<Swatch inline color={tokens.primary}>primary</Swatch>
```

### Block

```tsx
<Swatch block color={tokens.primary}>primary</Swatch>
```

### Spectrum

```tsx
<Row cozy>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-1"]} value="285" /></Column>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-2"]} value="205" /></Column>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-3"]} value="165" /></Column>
</Row>
```

### Tiles

```tsx
<Column snug>
  <Row snug>
    <Column fill><Swatch tile bare color={tokens.primary} ink={tokens["primary-foreground"]}>primary</Swatch></Column>
    <Column fill><Swatch tile bare color={tokens.success} ink={tokens["success-foreground"]}>success</Swatch></Column>
  </Row>
  <Row snug>
    <Column fill><Swatch tile small bare color={tokens["primary-soft"]} ink={tokens.primary}>primary-soft</Swatch></Column>
    <Column fill><Swatch tile small bare color={tokens["success-soft"]} ink={tokens.success}>success-soft</Swatch></Column>
  </Row>
</Column>
```

### Bar

```tsx
<Swatch bar inline color={tokens.secondary} value={tokens.secondary} />
```

### Steps

```tsx
<Column cozy>
  <Swatch block small steps={[tokens["chart-1"], tokens["chart-2"], tokens["chart-3"], tokens["chart-4"]]} accessibilityLabel="Ramp" />
  <Swatch segmented steps={[tokens["chart-1"], tokens["chart-2"], tokens["chart-3"], tokens["chart-4"]]} accessibilityLabel="Series" />
</Column>
```

### Compact

```tsx
<Row comfortable>
  <Column fill><Swatch block compact bare color={tokens.primary} value="primary">ion</Swatch></Column>
  <Column fill><Swatch block compact color={tokens.secondary} value="recess">secondary</Swatch></Column>
</Row>
```

### Selected

```tsx
<Row relaxed>
  <Swatch selected color={tokens.primary} value="--primary">primary</Swatch>
  <Swatch color={tokens.success} value="--success">success</Swatch>
</Row>
```

### Detail line

```tsx
<Swatch color={tokens.primary} value="--primary" detail="oklch(0.511 0.262 276.966)">
  primary
</Swatch>
```

### Palette picker

```tsx
<View role="radiogroup" aria-label="Palette">
  <Row snug alignCenter>
    <Swatch violet selected onPress={() => {}} />
    <Swatch cyan onPress={() => {}} />
    <Swatch mint onPress={() => {}} />
    <Swatch rose onPress={() => {}} />
    <Swatch amber onPress={() => {}} />
  </Row>
</View>
```

### Form-sized palette picker

```tsx
<View role="radiogroup" aria-label="Accent hue">
  <Row comfortable alignCenter>
    <Swatch small circle violet selected onPress={() => {}} />
    <Swatch small circle cyan onPress={() => {}} />
    <Swatch small circle mint onPress={() => {}} />
  </Row>
</View>
```

## Do & Don't

### Anatomy

**Do**: Let Swatch carry the name and the value, so every row of a sheet keeps one lockup and one accessible name.

```tsx
<Swatch color={tokens.primary} value="--primary">
  primary
</Swatch>
```

**Don't**: Set a bare block beside a hand-composed text column: the spacing and the type scale drift row to row, and the sample ships as an unnamed block.

```tsx
<Row snug alignCenter>
  <View style={{ height: 56, width: 56, borderRadius: 8, backgroundColor: "#4f46e5" }} />
  <Column tight>
    <Typography small medium>primary</Typography>
    <Typography tiny subtle>--primary</Typography>
  </Column>
</Row>
```

### Color source

**Do**: Pass the live token, so the sample repaints when the scheme flips.

```tsx
<Swatch color={tokens.card} value="--card">
  card
</Swatch>
```

**Don't**: Hard-code the value a token resolves to; the sample keeps showing the light color after the scheme flips to dark.

```tsx
<Swatch color="#ffffff" value="#ffffff">
  card
</Swatch>
```
