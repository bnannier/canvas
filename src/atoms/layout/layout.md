# Row & Column

The layout primitives. `Row` lays children out horizontally, `Column`
vertically. Both own arrangement through semantic boolean axes, a gap scale
(`flush` / `tight` / `snug` / `cozy` / `relaxed` / `loose`), main-axis
distribution (`center`, `between`, …), cross-axis alignment (`alignCenter`,
`baseline`, …), and `wrap` / `fill` / `grow`, so a call site never hand-rolls
`flexDirection`, `gap`, or `alignItems`.

## Usage

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</Row>
```

## Variants

### Vertical stack

```tsx
<Column relaxed>
  <Button primary block>Save</Button>
  <Button ghost block>Cancel</Button>
</Column>
```

### Centered row

```tsx
<Row center alignCenter snug>
  <Badge>schema</Badge>
  <Badge secondary>role</Badge>
  <Badge outline>tag</Badge>
</Row>
```

### Space between

```tsx
<Row between alignCenter>
  <Typography small>Request ID</Typography>
  <Typography mono>req_8f2c10ab</Typography>
</Row>
```

### Wrap

```tsx
<Row wrap snug>
  <Badge>alpha</Badge>
  <Badge>beta</Badge>
  <Badge>gamma</Badge>
  <Badge>delta</Badge>
  <Badge>epsilon</Badge>
  <Badge>zeta</Badge>
</Row>
```

### Padded surround

```tsx
<Row relaxed pad>
  <MediaObject avatar="RC" title="Rachel Chen" description="rachel.chen@example.com" />
</Row>
```

### Stacks at narrow widths

`stacks` renders the Row as a Column when the row's own container is at or
below `stackBreakpoint` (default `sm` = 640): container-measured, so it stacks
inside a narrow desktop column too, and the same gap, distribution, alignment,
and padding props apply to the new axes. Children keep their own sizing, which
makes `stacks` the tool for content-sized rows (a toolbar, a label beside its
actions); equal-width tiles that should renumber columns belong to `Grid`. A
Column never needs the inverse: a Column that must become a Row is a Row that
stacks.

```tsx
<Row stacks between alignCenter relaxed>
  <Input placeholder="Search runs…" />
  <Row snug>
    <Button outline>Filter</Button>
    <Button primary>New run</Button>
  </Row>
</Row>
```

## Do & Don't

### Gap

**Do** — Use the gap scale so spacing tracks the kit's spacing tokens.

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</Row>
```

**Don't** — Hand-roll `flexDirection` and a raw `gap`; that is a styling escape hatch.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</View>
```

### Alignment

**Do** — Reach for the main- and cross-axis booleans (`between`, `alignCenter`).

```tsx
<Row between alignCenter>
  <Typography small>Total</Typography>
  <Typography h5>$1,240.00</Typography>
</Row>
```

**Don't** — Push content around with raw `justifyContent` and `marginLeft`.

```tsx
<View style={{ flexDirection: "row" }}>
  <Text style={{ fontSize: 14, color: "#71717a" }}>Total</Text>
  <Text style={{ marginLeft: "auto", fontWeight: "600" }}>$1,240.00</Text>
</View>
```
