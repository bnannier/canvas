# Cards

Three families. `StatCard` = a single metric, big number + delta. `SectionCard` = a labeled content surface with optional header and divider. Generic `card` = bring your own structure. Density: pass `compact` or `comfortable` to tighten or relax the card's own padding and the gap between flat children (`compact` takes precedence, and a density prop pads the surface on its own).

## Usage

```tsx
<Card style={{ width: 280, padding: 20 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(palette["blue-500"], 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: palette["blue-600"] }}>U</Text>
    </View>
  </View>
</Card>
```

## Variants

### Type - section

```tsx
<Card
  onPress={() => {}}
  title="Recent activity"
  body="A labeled content surface. Drop fields, a list, or any module of content here."
/>
```

### Type - generic

```tsx
<Card
  padded
  onPress={() => {}}
  title="Anything goes here"
  body="The card surface gives you the border, radius, and shadow. You bring the content."
/>
```

### Icon tone - success

```tsx
<Card style={{ width: 280, padding: 20 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(palette["green-500"], 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: palette["green-600"] }}>S</Text>
    </View>
  </View>
</Card>
```

### Icon tone - purple

```tsx
<Card style={{ width: 280, padding: 20 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(palette["purple-500"], 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: palette["purple-600"] }}>O</Text>
    </View>
  </View>
</Card>
```

### Icon tone - destructive

```tsx
<Card style={{ width: 280, padding: 20 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(tokens.destructive, 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.destructive }}>!</Text>
    </View>
  </View>
</Card>
```

### Icon tone - amber

```tsx
<Card style={{ width: 280, padding: 20 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(palette["amber-500"], 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: palette["amber-600"] }}>T</Text>
    </View>
  </View>
</Card>
```

## Do & Don't

### stat

**Do** — One big number, a short label, a small delta. The metric is scannable in a glance.

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
    <View>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.4, color: tokens["muted-foreground"] }}>Active identities</Text>
      <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "700", color: tokens["card-foreground"] }}>12,348</Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: tokens["muted-foreground"] }}>+142 today</Text>
    </View>
    <View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: alpha(palette["blue-500"], 0.1) }}>
      <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: palette["blue-600"] }}>U</Text>
    </View>
  </View>
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
<Card style={{ maxWidth: 360 }}>
  <CardHeader>
    <CardTitle>Recent activity</CardTitle>
  </CardHeader>
  <CardSeparator />
  <CardContent>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["card-foreground"] }}>Two events today.</Text>
  </CardContent>
</Card>
```

**Don't** — Without the divider the header floats and stops reading as a header.

```tsx
<Card style={{ maxWidth: 360 }}>
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
  <Text style={{ marginBottom: 4, fontSize: 15, fontWeight: "600", color: tokens["card-foreground"] }}>Anything goes here</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>The card surface gives you the border, radius, and shadow. You bring the content.</Text>
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
