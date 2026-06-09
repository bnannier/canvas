# Selects

Native select restyled to match Canvas inputs.

## Usage

```tsx
<Select
  label="Country"
  value="United States"
  options={["United States", "Canada", "Mexico", "United Kingdom"]}
  placeholder="Select a country"
  className="max-w-[280px]"
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
  className="max-w-[280px]"
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
  className="max-w-[280px]"
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
  className="max-w-[280px]"
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
  className="max-w-[280px]"
/>
```

## Do & Don't

**Do** — Mark the placeholder disabled and selected so it prompts without being a valid choice.

```tsx
<Select open label="Country" placeholder="Choose a country…" options={["United States", "Canada", "Mexico"]} className="max-w-[280px]" />
```

**Don't** — A placeholder as a normal option can be submitted as a real value.

```tsx
<Select open label="Country" value="Choose a country…" options={["Choose a country…", "United States", "Canada", "Mexico"]} className="max-w-[280px]" />
```

### sm

**Do** — Keep the small select inline with a short label so it stays compact inside toolbars and table footers.

```tsx
<View className="flex-row items-center gap-2">
  <Text className="text-xs text-muted-foreground">Rows</Text>
  <Select small value="10" options={["10", "25", "50"]} className="w-auto" />
</View>
```

**Don't** — A stacked block label towers over the small control and breaks the dense row it belongs in.

```tsx
<Select small label="Rows per page" value="10" options={["10", "25", "50"]} className="max-w-[200px]" />
```

### default

**Do** — Match the default select to sibling inputs at the same height so the form row lines up.

```tsx
<View className="flex-row items-end gap-3 max-w-[420px]">
  <View className="flex-1">
    <Text className="mb-1.5 text-sm font-medium text-foreground">City</Text>
    <Input value="Austin" />
  </View>
  <View className="flex-1">
    <Text className="mb-1.5 text-sm font-medium text-foreground">State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

**Don't** — A default select next to a taller lg input leaves the row baselines misaligned.

```tsx
<View className="flex-row items-end gap-3 max-w-[420px]">
  <View className="flex-1">
    <Text className="mb-1.5 text-sm font-medium text-foreground">City</Text>
    <Input large value="Austin" />
  </View>
  <View className="flex-1">
    <Text className="mb-1.5 text-sm font-medium text-foreground">State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

### lg

**Do** — Scale the text up with the height so the large select reads as a deliberate, touch-friendly target.

```tsx
<Select large label="Plan" value="Starter" options={["Starter", "Pro", "Enterprise"]} className="max-w-[320px]" />
```

**Don't** — Tiny option text inside a tall control wastes the height and looks like an accidental mismatch.

```tsx
<View className="max-w-[320px]">
  <Text className="mb-1.5 text-sm font-medium text-foreground">Plan</Text>
  <Pressable className="h-10 flex-row items-center justify-between rounded-md border border-input bg-background px-3" accessibilityRole="button">
    <Text className="text-xs text-foreground">Starter</Text>
    <Text className="text-xs text-muted-foreground">▾</Text>
  </Pressable>
</View>
```
