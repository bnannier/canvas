# Textareas

Multi-line input, with character count, with toolbar.

## Usage

```tsx
<Textarea rows={4} placeholder="A few words about this project" />
```

## Variants

### Character counter

```tsx
<View className="max-w-[400px]">
  <Text className="mb-1.5 text-sm font-medium text-foreground">Description</Text>
  <Textarea rows={4} placeholder="A few words about this project…" />
  <View className="mt-1 flex-row justify-end">
    <Text className="text-[11px] text-muted-foreground">0 / 280</Text>
  </View>
</View>
```

### Formatting toolbar

```tsx
<View className="max-w-[400px] overflow-hidden rounded-md border border-border">
  <View className="flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
    <Button ghost small className="min-w-8 px-2">B</Button>
    <Button ghost small className="min-w-8 px-2">I</Button>
    <Button ghost small className="min-w-8 px-2"></></Button>
    <View className="mx-1 h-4 w-px bg-border" />
    <Button ghost small className="px-3">Comment</Button>
  </View>
  <Textarea rows={4} placeholder="Leave a comment…" className="min-h-[104px] w-full rounded-none border-0" />
</View>
```

### Disabled

```tsx
<Textarea rows={4} disabled placeholder="A few words about this project" />
```

## Do & Don't

### With label

**Do** — Give a sensible min-height and allow vertical resize so users can see and grow their text.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Description</Text>
  <Textarea rows={3} value="This is a longer description that runs past one line and stays readable." />
</View>
```

**Don't** — A locked, single-line textarea hides long content with no way to expand.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Description</Text>
  <TextInput numberOfLines={1} value="This is a longer description that runs past one line and gets clipped." className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground" />
</View>
```

### Character counter

**Do** — Show the live count against the cap and turn it destructive past the limit so the overage is precise.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Bio</Text>
  <Textarea rows={3} invalid value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
  <View className="mt-1 flex-row justify-end">
    <Text className="text-[11px] text-destructive">123 / 120</Text>
  </View>
</View>
```

**Don't** — A vague "over limit" message gives no number, so users cannot tell how much to trim.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Bio</Text>
  <Textarea rows={3} value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
  <View className="mt-1 flex-row justify-end">
    <Text className="text-[11px] text-muted-foreground">over limit</Text>
  </View>
</View>
```

### Formatting toolbar

**Do** — Make each control a real focusable button that toggles an active state when pressed.

```tsx
<View className="max-w-[400px] overflow-hidden rounded-md border border-border">
  <View className="flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
    <Button ghost small className="font-bold">B</Button>
    <Button ghost small className="italic">I</Button>
    <Button ghost small className="font-mono text-[11px]"></></Button>
  </View>
  <Textarea rows={4} placeholder="Leave a comment" className="rounded-none border-0 shadow-none" />
</View>
```

**Don't** — Static, unclickable glyphs look like a toolbar but cannot be pressed or focused.

```tsx
<View className="max-w-[400px] overflow-hidden rounded-md border border-border">
  <View className="flex-row items-center gap-1 border-b border-border bg-muted/30 px-3 py-2">
    <Text className="px-2 text-sm font-bold">B</Text>
    <Text className="px-2 text-sm italic">I</Text>
    <Text className="px-2 font-mono text-[11px]"></></Text>
  </View>
  <Textarea rows={4} placeholder="Leave a comment" className="rounded-none border-0 shadow-none" />
</View>
```

### Disabled

**Do** — Use the disabled attribute so the field blocks editing and focus, matching its dimmed look.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Description</Text>
  <Textarea rows={3} disabled value="Read-only content the user must not change." />
</View>
```

**Don't** — Dimming a textarea while leaving it editable looks disabled but still accepts input.

```tsx
<View className="max-w-[400px] flex-col gap-1.5">
  <Text className="text-sm font-medium text-foreground">Description</Text>
  <TextInput multiline editable textAlignVertical="top" value="Read-only content the user must not change." className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground opacity-50" />
</View>
```
