# IconTile

A tinted rounded square that holds a single `Icon`, the recurring "icon on a
soft background" used in cards, media objects, empty states, and feeds. IconTile
owns the surface and the icon color: pick a tone and it tints the square and
paints the glyph to match, so a call site never hand-composes `borderRadius` +
`backgroundColor` to build an icon background.

## Usage

```tsx
<IconTile primary>
  <Icon shield />
</IconTile>
```

## Variants

### Tones

```tsx
<Row snug alignCenter>
  <IconTile primary><Icon shield /></IconTile>
  <IconTile success><Icon check /></IconTile>
  <IconTile destructive><Icon trash /></IconTile>
  <IconTile muted><Icon bell /></IconTile>
</Row>
```

### Sizes

```tsx
<Row snug alignCenter>
  <IconTile small primary><Icon bell /></IconTile>
  <IconTile primary><Icon bell /></IconTile>
  <IconTile large primary><Icon bell /></IconTile>
</Row>
```

### Circle

```tsx
<IconTile circle success>
  <Icon check />
</IconTile>
```

## Do & Don't

### Surface

**Do** — Use IconTile so the tint and icon color stay in sync from one tone prop.

```tsx
<IconTile primary>
  <Icon shield />
</IconTile>
```

**Don't** — Hand-compose the tinted square with raw `borderRadius`, `backgroundColor`, and padding.

```tsx
<View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "rgba(79,70,229,0.1)" }}>
  <Icon shield primary />
</View>
```
