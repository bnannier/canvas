# Radios

Single-pick selection: stacked, inline, card-style.

## Usage

```tsx
<Column snug>
  <Row snug alignStart>
    <Radio style={{ marginTop: 3 }} />
    <Column>
      <Typography small medium>Hobby</Typography>
      <Typography tiny muted>For personal projects and experiments.</Typography>
    </Column>
  </Row>
  <Row snug alignStart>
    <Radio checked style={{ marginTop: 3 }} />
    <Column>
      <Typography small medium>Pro</Typography>
      <Typography tiny muted>For growing teams that need more control.</Typography>
    </Column>
  </Row>
  <Row snug alignStart>
    <Radio style={{ marginTop: 3 }} />
    <Column>
      <Typography small medium>Enterprise</Typography>
      <Typography tiny muted>Advanced security, compliance, and support.</Typography>
    </Column>
  </Row>
</Column>
```

## Variants

### Variant - inline

```tsx
<Radio checked small>Pro, for growing teams that need more control.</Radio>
```

### Variant - card

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, padding: 14, borderWidth: 1, borderColor: tokens.border }}>
    <Radio style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Hobby</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For personal projects and experiments.</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, padding: 14, borderWidth: 2, borderColor: tokens.primary, backgroundColor: alpha(tokens.primary, 0.05) }}>
    <Radio checked style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Pro</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams that need more control.</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, padding: 14, borderWidth: 1, borderColor: tokens.border }}>
    <Radio style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Enterprise</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Advanced security, compliance, and support.</Text>
  </View>
</View>
```

## Do & Don't

**Do** — Pre-select a sensible default so the common path needs no clicks.

```tsx
<Column snug>
  <Typography small semibold style={{ marginBottom: 4 }}>Plan</Typography>
  <Radio>Hobby</Radio>
  <Radio checked>Pro</Radio>
  <Radio>Enterprise</Radio>
</Column>
```

**Don't** — Leaving a radio group with nothing selected forces an extra decision and can submit empty.

```tsx
<View style={{ flexDirection: "column", gap: 8 }}>
  <Text style={{ marginBottom: 4, fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Plan</Text>
  <Radio>Hobby</Radio>
  <Radio>Pro</Radio>
  <Radio>Enterprise</Radio>
</View>
```

### Stacked

**Do** — Align the control to the first text line (mt-[3px]) so it sits beside the title, with the description flowing below.

```tsx
<Column snug>
  <Row snug alignStart>
    <Radio checked style={{ marginTop: 3 }} />
    <Column>
      <Typography small medium>Pro</Typography>
      <Typography tiny muted>For growing teams that need more control.</Typography>
    </Column>
  </Row>
</Column>
```

**Don't** — With items-center the input floats to the vertical middle of a two-line label, leaving it visually unattached to the title it controls.

```tsx
<View style={{ flexDirection: "column", gap: 10 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <Radio checked />
    <View>
      <Text style={{ fontSize: 13, fontWeight: "500", color: tokens.foreground }}>Pro</Text>
      <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams that need more control.</Text>
    </View>
  </View>
</View>
```

### Inline

**Do** — Use gap-6 between options (gap-2 inside each) so every label clearly pairs with its own control.

```tsx
<Row loose wrap>
  <Radio checked small>Hobby</Radio>
  <Radio small>Pro</Radio>
  <Radio small>Enterprise</Radio>
</Row>
```

**Don't** — Cramped gap-1 between options makes each label blur into the next radio, so it is hard to tell which dot belongs to which choice.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
  <Radio checked small>Hobby</Radio>
  <Radio small>Pro</Radio>
  <Radio small>Enterprise</Radio>
</View>
```

### Card

**Do** — Give the selected card a primary border and tinted fill so the whole tile reads as chosen, not just the dot.

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 2, borderColor: tokens.primary, backgroundColor: alpha(tokens.primary, 0.05), padding: 14 }}>
    <Radio checked style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Pro</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams.</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
    <Radio style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Enterprise</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Advanced security.</Text>
  </View>
</View>
```

**Don't** — When the selected card keeps the same plain border, only the tiny native dot signals the choice and the active card is easy to miss.

```tsx
<View style={{ flexDirection: "row", gap: 8 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
    <Radio checked style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Pro</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>For growing teams.</Text>
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", flexDirection: "column", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, padding: 14 }}>
    <Radio style={{ marginBottom: 8 }} />
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Enterprise</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Advanced security.</Text>
  </View>
</View>
```
