# Checkboxes

Multi-select option, single yes/no, grouped lists.

## Usage

```tsx
<View className="flex-row items-start gap-2">
  <Checkbox checked />
  <View className="gap-0.5">
    <Text className="text-sm font-medium text-foreground">Email notifications</Text>
    <Text className="text-xs text-muted-foreground">Get notified when activity happens on your account.</Text>
  </View>
</View>
```

## Variants

### State - unchecked

```tsx
<View className="flex-row items-start gap-2">
  <Checkbox />
  <View className="gap-0.5">
    <Text className="text-sm font-medium text-foreground">Email notifications</Text>
    <Text className="text-xs text-muted-foreground">Get notified when activity happens on your account.</Text>
  </View>
</View>
```

### State - disabled

```tsx
<View className="flex-row items-start gap-2">
  <Checkbox disabled />
  <View className="gap-0.5">
    <Text className="text-sm font-medium text-foreground">Email notifications</Text>
    <Text className="text-xs text-muted-foreground">Get notified when activity happens on your account.</Text>
  </View>
</View>
```

## Do & Don't

### Unchecked

**Do** — Leave opt-in consent unchecked so agreeing is a deliberate act the user takes.

```tsx
<Checkbox>Email me product news, offers, and survey invitations.</Checkbox>
```

**Don't** — A consent box that starts checked opts users in by default; under GDPR pre-ticked consent is not consent.

```tsx
<Checkbox checked>Email me product news, offers, and survey invitations.</Checkbox>
```

### Checked

**Do** — Show the parent indeterminate (a dash, not a tick) when only some children are checked.

```tsx
<View className="gap-2">
  <Checkbox indeterminate>Select all</Checkbox>
  <View className="ml-6 gap-2">
    <Checkbox checked>Read</Checkbox>
    <Checkbox>Write</Checkbox>
    <Checkbox>Delete</Checkbox>
  </View>
</View>
```

**Don't** — A fully checked parent claims every child is selected when only one is, so the state reads as a lie.

```tsx
<View className="gap-2">
  <Checkbox checked>Select all</Checkbox>
  <View className="ml-6 gap-2">
    <Checkbox checked>Read</Checkbox>
    <Checkbox>Write</Checkbox>
    <Checkbox>Delete</Checkbox>
  </View>
</View>
```

### Disabled

**Do** — Say why it's unavailable, like a plan gate, or don't show it at all.

```tsx
<View className="flex-row items-center gap-1.5">
  <Checkbox disabled>Export to CSV</Checkbox>
  <Text className="text-xs text-muted-foreground">(Pro plan)</Text>
</View>
```

**Don't** — A disabled option with no reason leaves users stuck and guessing.

```tsx
<Checkbox disabled>Export to CSV</Checkbox>
```

### Selection

**Do** — Radios for one-of-many; reserve checkboxes for independent multi-select.

```tsx
<View className="gap-2">
  <Text className="mb-1 text-sm font-semibold text-foreground">Plan</Text>
  <Radio>Free</Radio>
  <Radio checked>Pro</Radio>
  <Radio>Enterprise</Radio>
</View>
```

**Don't** — Checkboxes allow multiple selections; for a one-of choice they let users pick contradictory options.

```tsx
<View className="gap-2">
  <Text className="mb-1 text-sm font-semibold text-foreground">Plan</Text>
  <Checkbox>Free</Checkbox>
  <Checkbox checked>Pro</Checkbox>
  <Checkbox>Enterprise</Checkbox>
</View>
```

### With description

**Do** — Wrap the box, label, and description in a <label> so the whole row toggles.

```tsx
<Checkbox checked>
  <Text className="text-sm font-medium text-foreground">Email notifications</Text>
  <Text className="text-xs font-normal text-muted-foreground">
Get notified when activity happens on your account.</Text>
</Checkbox>
```

**Don't** — A bare div makes only the 16px box clickable; the label text does nothing.

```tsx
<View className="flex-row items-start gap-2">
  <Checkbox checked />
  <View>
    <Text className="text-sm font-medium text-foreground">Email notifications</Text>
    <Text className="text-xs text-muted-foreground">Get notified when activity happens on your account.</Text>
  </View>
</View>
```
