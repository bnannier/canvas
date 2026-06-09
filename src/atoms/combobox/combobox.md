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
  className="max-w-[300px]"
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
  className="max-w-[300px]"
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
  className="max-w-[300px]"
/>
```

## Do & Don't

### When to use

**Do** — A plain select for short, fixed lists; reserve the combobox for long, searchable ones.

```tsx
<Select label="Size" options={["Small", "Medium", "Large"]} open placeholder="Select a size" className="max-w-[280px]" />
```

**Don't** — Type or click: a search field for three fixed options is overhead with nothing to filter.

```tsx
<Combobox label="Size" options={["Small", "Medium", "Large"]} open placeholder="Search…" className="max-w-[280px]" />
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
  ]} query="co" open className="max-w-[280px]" />
```

**Don't** — Try typing: a search box that ignores input is just a dropdown wearing a costume.

```tsx
<View className="relative w-full max-w-[280px]">
  <Text className="mb-1.5 font-medium text-foreground text-sm">Assigned to</Text>
  <View className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 h-9">
    <Text className="text-sm text-foreground">co</Text>
    <Text className="text-muted-foreground text-sm">▾</Text>
  </View>
  <View className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[240px] rounded-md border border-border bg-popover p-1 shadow-lg">
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Wade Cooper</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Arlene Mccoy</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Devon Webb</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Tom Cook</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Tanya Fox</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Hellen Schmidt</Text>
    </View>
  </View>
</View>
```

### Selection

**Do** — Click an option: it fills the input and stays marked as selected.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"]} value="Devon Webb" open className="max-w-[280px]" />
```

**Don't** — Click an option: it flashes but the field stays empty, so you can't tell what you picked.

```tsx
<View className="relative w-full max-w-[280px]">
  <Text className="mb-1.5 font-medium text-foreground text-sm">Assigned to</Text>
  <View className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 h-9">
    <Text className="text-sm text-muted-foreground">Pick a person…</Text>
    <Text className="text-muted-foreground text-sm">▾</Text>
  </View>
  <View className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[240px] rounded-md border border-border bg-popover p-1 shadow-lg">
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Wade Cooper</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Arlene Mccoy</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Devon Webb</Text>
    </View>
    <View className="flex-row items-center gap-2 rounded-sm px-2 py-1.5">
      <Text className="text-sm text-popover-foreground" style={{ width: 14 }}> </Text>
      <Text className="text-sm text-popover-foreground">Tom Cook</Text>
    </View>
  </View>
</View>
```

### With label

**Do** — A persistent label keeps the field named after a selection has filled the input.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} value="Devon Webb" open className="max-w-[280px]" />
```

**Don't** — Once a value replaces the placeholder, an unlabeled field has nothing left to name it.

```tsx
<Combobox options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} value="Devon Webb" open className="max-w-[280px]" />
```

### With helper text

**Do** — A short placeholder plus persistent helper text keeps the rule visible while you type.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} open placeholder="Search a person…" helperText="Deactivated users are hidden from the list." className="max-w-[280px]" />
```

**Don't** — Type a letter: guidance crammed into the placeholder vanishes the moment you start.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} open placeholder="Pick an active teammate; deactivated users are hidden" className="max-w-[280px]" />
```

### Disabled

**Do** — Show the locked value and say why it's fixed, so disabled reads as a settled choice.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} value="Devon Webb" disabled helperText="Set by the project owner and can't be changed here." className="max-w-[280px]" />
```

**Don't** — An empty, dimmed field with no value reads as broken, not as intentionally locked.

```tsx
<Combobox label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} disabled placeholder="Search a person…" className="max-w-[280px]" />
```
