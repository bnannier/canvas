# Listboxes

A custom (non-native) select: single or multi-select, optional avatars or icons per option, and a checkmark on the chosen items. Reach for it when a native select can't show rich options; prefer a native select for simple short lists.

## Usage

```tsx
<Listbox
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: false },
    { label: "Design", selected: false },
    { label: "Platform", selected: false },
    { label: "Security", selected: false }
  ]}
  bordered
/>
```

## Do & Don't

### Prefer a native select for simple lists

**Do** — For short, plain lists a native select is lighter, accessible, and uses the platform picker on mobile.

```tsx
<Select open value="Yes" options={["Yes", "No"]} className="w-48" />
```

**Don't** — A custom listbox for two short options is heavier than it needs to be and worse on mobile.

```tsx
<Listbox bordered className="w-48" items={[
    { label: "Yes", selected: true },
    { label: "No" }
  ]} />
```

### single

**Do** — Show exactly one checkmark, mirror it in the trigger value, and close the panel on pick.

```tsx
<Listbox bordered className="w-56" items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

**Don't** — Single-select with two checkmarks lies about state: only one option can be the value.

```tsx
<Listbox bordered className="w-56" items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

### multi

**Do** — Keep the panel open, toggle each option's own checkmark, and summarize the count in the trigger.

```tsx
<View className="w-56 gap-1">
  <View className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 h-9">
    <Text className="text-sm text-foreground">3 selected</Text>
    <Text className="text-sm text-muted-foreground">▾</Text>
  </View>
  <Listbox multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</View>
```

**Don't** — Don't close on each pick or echo only the last choice: multi-select needs to keep all selections visible.

```tsx
<View className="w-56 gap-1">
  <View className="flex-row items-center justify-between rounded-md border border-input bg-background px-3 h-9">
    <Text className="text-sm text-foreground">Backend</Text>
    <Text className="text-sm text-muted-foreground">▾</Text>
  </View>
  <Listbox multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</View>
```
