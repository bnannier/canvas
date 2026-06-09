# Radios

Single-pick selection: stacked, inline, card-style.

## Usage

```tsx
<View className="flex-col gap-2.5">
  <View className="flex-row gap-2">
    <Radio className="mt-[3px]" />
    <View>
      <Text className="text-[13px] font-medium text-foreground">Hobby</Text>
      <Text className="text-xs text-muted-foreground">For personal projects and experiments.</Text>
    </View>
  </View>
  <View className="flex-row gap-2">
    <Radio checked className="mt-[3px]" />
    <View>
      <Text className="text-[13px] font-medium text-foreground">Pro</Text>
      <Text className="text-xs text-muted-foreground">For growing teams that need more control.</Text>
    </View>
  </View>
  <View className="flex-row gap-2">
    <Radio className="mt-[3px]" />
    <View>
      <Text className="text-[13px] font-medium text-foreground">Enterprise</Text>
      <Text className="text-xs text-muted-foreground">Advanced security, compliance, and support.</Text>
    </View>
  </View>
</View>
```

## Do & Don't

**Do** — Pre-select a sensible default so the common path needs no clicks.

```tsx
<View className="flex-col gap-2">
  <Text className="mb-1 text-sm font-semibold text-foreground">Plan</Text>
  <Radio>Hobby</Radio>
  <Radio checked>Pro</Radio>
  <Radio>Enterprise</Radio>
</View>
```

**Don't** — Leaving a radio group with nothing selected forces an extra decision and can submit empty.

```tsx
<View className="flex-col gap-2">
  <Text className="mb-1 text-sm font-semibold text-foreground">Plan</Text>
  <Radio>Hobby</Radio>
  <Radio>Pro</Radio>
  <Radio>Enterprise</Radio>
</View>
```

### Stacked

**Do** — Align the control to the first text line (mt-[3px]) so it sits beside the title, with the description flowing below.

```tsx
<View className="flex-col gap-2.5">
  <View className="flex-row gap-2">
    <Radio checked className="mt-[3px]" />
    <View>
      <Text className="text-[13px] font-medium text-foreground">Pro</Text>
      <Text className="text-xs text-muted-foreground">For growing teams that need more control.</Text>
    </View>
  </View>
</View>
```

**Don't** — With items-center the input floats to the vertical middle of a two-line label, leaving it visually unattached to the title it controls.

```tsx
<View className="flex-col gap-2.5">
  <View className="flex-row items-center gap-2">
    <Radio checked />
    <View>
      <Text className="text-[13px] font-medium text-foreground">Pro</Text>
      <Text className="text-xs text-muted-foreground">For growing teams that need more control.</Text>
    </View>
  </View>
</View>
```

### Inline

**Do** — Use gap-6 between options (gap-2 inside each) so every label clearly pairs with its own control.

```tsx
<View className="flex-row flex-wrap gap-6">
  <Radio checked small>Hobby</Radio>
  <Radio small>Pro</Radio>
  <Radio small>Enterprise</Radio>
</View>
```

**Don't** — Cramped gap-1 between options makes each label blur into the next radio, so it is hard to tell which dot belongs to which choice.

```tsx
<View className="flex-row flex-wrap gap-1.5">
  <Radio checked small>Hobby</Radio>
  <Radio small>Pro</Radio>
  <Radio small>Enterprise</Radio>
</View>
```

### Card

**Do** — Give the selected card a primary border and tinted fill so the whole tile reads as chosen, not just the dot.

```tsx
<View className="grid grid-cols-2 gap-2">
  <View className="flex-col rounded-md border-2 border-primary bg-primary/5 p-3.5">
    <Radio checked className="mb-2" />
    <Text className="text-[13px] font-semibold text-foreground">Pro</Text>
    <Text className="text-xs text-muted-foreground">For growing teams.</Text>
  </View>
  <View className="flex-col rounded-md border border-border p-3.5">
    <Radio className="mb-2" />
    <Text className="text-[13px] font-semibold text-foreground">Enterprise</Text>
    <Text className="text-xs text-muted-foreground">Advanced security.</Text>
  </View>
</View>
```

**Don't** — When the selected card keeps the same plain border, only the tiny native dot signals the choice and the active card is easy to miss.

```tsx
<View className="grid grid-cols-2 gap-2">
  <View className="flex-col rounded-md border border-border p-3.5">
    <Radio checked className="mb-2" />
    <Text className="text-[13px] font-semibold text-foreground">Pro</Text>
    <Text className="text-xs text-muted-foreground">For growing teams.</Text>
  </View>
  <View className="flex-col rounded-md border border-border p-3.5">
    <Radio className="mb-2" />
    <Text className="text-[13px] font-semibold text-foreground">Enterprise</Text>
    <Text className="text-xs text-muted-foreground">Advanced security.</Text>
  </View>
</View>
```
