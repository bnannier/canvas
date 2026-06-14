# Selects

Native select restyled to match Canvas inputs.

## Usage

```tsx
<Select
  label="Country"
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  style={{ maxWidth: 280 }}
/>
```

## Variants

### Size - sm

```tsx
<Select
  small
  label="Country"
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  style={{ maxWidth: 280 }}
/>
```

### Size - lg

```tsx
<Select
  large
  label="Country"
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  style={{ maxWidth: 280 }}
/>
```

### With leading icon

```tsx
<Select
  label="Country"
  icon
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  style={{ maxWidth: 280 }}
/>
```

### Disabled

```tsx
<Select
  disabled
  label="Country"
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  style={{ maxWidth: 280 }}
/>
```

## Do & Don't

**Do** — Mark the placeholder disabled and selected so it prompts without being a valid choice.

```tsx
<View style={{ minHeight: 220 }}>
  <Select open label="Country" placeholder="Choose a country…" options={["United States", "Canada", "Mexico"]} style={{ maxWidth: 280 }} />
</View>
```

**Don't** — A placeholder as a normal option can be submitted as a real value.

```tsx
<View style={{ minHeight: 260 }}>
  <Select open label="Country" value="Choose a country…" options={["Choose a country…", "United States", "Canada", "Mexico"]} style={{ maxWidth: 280 }} />
</View>
```

### sm

**Do** — Keep the small select inline with a short label so it stays compact inside toolbars and table footers.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Rows</Text>
  <Select small value="10" options={["10", "25", "50"]} style={{ width: "auto" }} />
</View>
```

**Don't** — A stacked block label towers over the small control and breaks the dense row it belongs in.

```tsx
<Select small label="Rows per page" value="10" options={["10", "25", "50"]} style={{ maxWidth: 200 }} />
```

### default

**Do** — Match the default select to sibling inputs at the same height so the form row lines up.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, maxWidth: 420 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>City</Text>
    <Input value="Austin" />
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

**Don't** — A default select next to a taller lg input leaves the row baselines misaligned.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, maxWidth: 420 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>City</Text>
    <Input large value="Austin" />
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

### lg

**Do** — Scale the text up with the height so the large select reads as a deliberate, touch-friendly target.

```tsx
<Select large label="Plan" value="Starter" options={["Starter", "Pro", "Enterprise"]} style={{ maxWidth: 320 }} />
```

**Don't** — Tiny option text inside a tall control wastes the height and looks like an accidental mismatch.

```tsx
<View style={{ maxWidth: 320 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Plan</Text>
  <Pressable style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }} accessibilityRole="button">
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens.foreground }}>Starter</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>▾</Text>
  </Pressable>
</View>
```
