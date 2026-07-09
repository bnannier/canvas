# Comboboxes

Text input + dropdown: searchable single-select.

## Usage

```tsx
<Combobox
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  placeholder="Search a person…"
  style={{ maxWidth: 300 }}
/>
```

## Variants

### With helper text

```tsx
<Combobox
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  helperText="The person responsible for this account."
  placeholder="Search a person…"
  style={{ maxWidth: 300 }}
/>
```

### Disabled

```tsx
<Combobox
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  placeholder="Search a person…"
  disabled
  style={{ maxWidth: 300 }}
/>
```

## Do & Don't

### When to use

**Do** — A plain select for short, fixed lists; reserve the combobox for long, searchable ones.

```tsx
<Select label="Size" options={["Small", "Medium", "Large"]} defaultOpen placeholder="Select a size" style={{ maxWidth: 280 }} />
```

**Don't** — Type or click: a search field for three fixed options is overhead with nothing to filter.

```tsx
<Combobox label="Size" options={["Small", "Medium", "Large"]} defaultOpen placeholder="Search…" style={{ maxWidth: 280 }} />
```

### Filtering

**Do** — Type a few letters: the list narrows as you go, so a long list stays usable.

```tsx
<Combobox label="Assigned to" options={[
    "Wade Cooper",
    "Arlene Mccoy",
    "Devon Webb",
    "Tom Cook",
    "Tanya Fox",
    "Hellen Schmidt"
  ]} defaultQuery="co" defaultOpen style={{ maxWidth: 280 }} />
```

**Don't** — Try typing: a search box that ignores input is just a dropdown wearing a costume.

```tsx
<View style={{ position: "relative", width: "100%", maxWidth: 280 }}>
  <Text style={{ marginBottom: 6, fontWeight: "500", color: tokens.foreground, fontSize: 14, lineHeight: 20 }}>Assigned to</Text>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, height: 36 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>co</Text>
    <Text style={{ color: tokens["muted-foreground"], fontSize: 14, lineHeight: 20 }}>▾</Text>
  </View>
  <View style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 4, maxHeight: 240, borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 4, ...shadow("lg") }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Wade Cooper</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Arlene Mccoy</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Devon Webb</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Tom Cook</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Tanya Fox</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Hellen Schmidt</Text>
    </View>
  </View>
</View>
```

### Selection

**Do** — Click an option: it fills the input and stays marked as selected.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"]} defaultValue="Devon Webb" defaultOpen style={{ maxWidth: 280 }} />
```

**Don't** — Click an option: it flashes but the field stays empty, so you can't tell what you picked.

```tsx
<View style={{ position: "relative", width: "100%", maxWidth: 280 }}>
  <Text style={{ marginBottom: 6, fontWeight: "500", color: tokens.foreground, fontSize: 14, lineHeight: 20 }}>Assigned to</Text>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, height: 36 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Pick a person…</Text>
    <Text style={{ color: tokens["muted-foreground"], fontSize: 14, lineHeight: 20 }}>▾</Text>
  </View>
  <View style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 4, maxHeight: 240, borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 4, ...shadow("lg") }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Wade Cooper</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Arlene Mccoy</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Devon Webb</Text>
    </View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"], width: 14 }}> </Text>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>Tom Cook</Text>
    </View>
  </View>
</View>
```

### With label

**Do** — A persistent label keeps the field named after a selection has filled the input.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" defaultOpen style={{ maxWidth: 280 }} />
```

**Don't** — Once a value replaces the placeholder, an unlabeled field has nothing left to name it.

```tsx
<Combobox options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" defaultOpen style={{ maxWidth: 280 }} />
```

### With helper text

**Do** — A short placeholder plus persistent helper text keeps the rule visible while you type.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultOpen placeholder="Search a person…" helperText="Deactivated users are hidden from the list." style={{ maxWidth: 280 }} />
```

**Don't** — Type a letter: guidance crammed into the placeholder vanishes the moment you start.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultOpen placeholder="Pick an active teammate; deactivated users are hidden" style={{ maxWidth: 280 }} />
```

### Disabled

**Do** — Show the locked value and say why it's fixed, so disabled reads as a settled choice.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" disabled helperText="Set by the project owner and can't be changed here." style={{ maxWidth: 280 }} />
```

**Don't** — An empty, dimmed field with no value reads as broken, not as intentionally locked.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} disabled placeholder="Search a person…" style={{ maxWidth: 280 }} />
```
