# Card

Three families. `StatCard` = a single metric, big number + delta. `SectionCard` = a labeled content surface with optional header and divider. Generic `card` = bring your own structure. A card with content is padded by default, so a bare `<Card>` reads right on its own; pass `flush` for edge-to-edge content (a table, a nav bar) or when you compose the self-padding `CardHeader`/`CardContent`. The data-driven string form (`title` / `description` / `body` / `footer`, no children) renders self-padding sections, so it needs no `padded`. Density: pass `compact` or `comfortable` to tighten or relax the card's own padding and the gap between flat children (`compact` takes precedence, and a density prop pads the surface on its own).

## Usage

```tsx
<Card padded style={{ width: 280 }}>
  <Row between alignStart>
    <Column tight>
      <Typography caption medium>Active identities</Typography>
      <Typography h3 bold>12,348</Typography>
      <Typography tiny muted>+142 today</Typography>
    </Column>
    <Emblem primary label="U" />
  </Row>
</Card>
```

## Variants

### Section

```tsx
<Card
  onPress={() => {}}
  title="Recent activity"
  body="A labeled content surface. Drop fields, a list, or any module of content here."
/>
```

### Generic

```tsx
<Card style={{ maxWidth: 360 }}>
  <Column tight>
    <Typography lead semibold>Anything goes here</Typography>
    <Typography small muted>The card surface gives you the border, radius, and shadow. You bring the content.</Typography>
  </Column>
</Card>
```

## Do & Don't

### stat

**Do** — One big number, a short label, a small delta. The metric is scannable in a glance.

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <Row between alignStart>
    <Column tight>
      <Typography caption medium>Active identities</Typography>
      <Typography h3 bold>12,348</Typography>
      <Typography tiny muted>+142 today</Typography>
    </Column>
    <Emblem primary label="U" />
  </Row>
</Card>
```

**Don't** — Prose where the number should be: the eye has nothing big to land on, so the card stops being a stat.

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>This month</Text>
  <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["card-foreground"] }}>We onboarded 12,348 active identities, up 142 today, with churn holding steady.</Text>
</Card>
```

### section

**Do** — Keep the divider between header and body; it anchors the title.

```tsx
<Card flush style={{ maxWidth: 360 }}>
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
  </CardHeader>
  <CardSeparator />
  <CardContent>
    <Typography small>Two events today.</Typography>
  </CardContent>
</Card>
```

**Don't** — Without the divider the header floats and stops reading as a header.

```tsx
<Card flush style={{ maxWidth: 360 }}>
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
  </CardHeader>
  <CardContent>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>Two events today.</Text>
  </CardContent>
</Card>
```

### generic

**Do** — Use the surface once and layout the content with plain spacing inside it.

```tsx
<Card padded style={{ maxWidth: 360 }}>
  <Column tight>
    <Typography lead semibold>Anything goes here</Typography>
    <Typography small muted>The card surface gives you the border, radius, and shadow. You bring the content.</Typography>
  </Column>
</Card>
```

**Don't** — Nesting one card surface inside another stacks border on border and shadow on shadow; the inner block looks dropped in.

```tsx
<Card padded style={{ maxWidth: 360 }}>
  <Card padded>
    <Text style={{ marginBottom: 4, fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Nested surface</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>A card inside a card doubles the border and shadow.</Text>
  </Card>
</Card>
```
