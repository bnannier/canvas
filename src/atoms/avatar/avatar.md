# Avatars

A photo when the account has one, falling back to two initials on a brand gradient (seeded admin accounts). Sizes scale font proportionally (40% of diameter).

## Usage

```tsx
<Avatar name="AO" />
```

## Variants

### Variant - stacked

```tsx
<View className="flex-row items-center">
  <Avatar ring src="/rachel-chen.jpg" name="RC" />
  <Avatar ring src="/liang-bao.jpg" name="LB" className="-ml-3" />
  <Avatar ring src="/marcus-allen.jpg" name="LB" className="-ml-3" />
  <Avatar ring src="/kira-tanaka.jpg" name="KT" className="-ml-3" />
</View>
```

### Variant - topbar

```tsx
<Dropdown items={[
    { label: "Your profile", icon: "👤" },
    { label: "Settings", icon: "⚙" },
    { label: "Sign out", icon: "↩", separatorBefore: true }
  ]}>
  <View className="flex-row items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5">
    <Avatar small src="/marcus-allen.jpg" name="MA" />
    <Text className="text-sm font-medium text-foreground">admin@example.com</Text>
    <Icon chevronDown muted size={12} />
  </View>
</Dropdown>
```

### Variant - identity

```tsx
<View className="flex-row items-center gap-4">
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text className="text-base font-semibold text-foreground">Rachel Chen</Text>
    <Text className="text-sm text-muted-foreground">rachel.chen@example.com</Text>
  </View>
</View>
```

### Variant - menu

```tsx
<View className="flex-row items-center gap-3 border-b border-border pb-3">
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text className="text-sm font-semibold text-foreground">Ada Lovelace</Text>
    <Text className="text-xs text-muted-foreground">admin@example.com</Text>
  </View>
</View>
```

### Ring outline

```tsx
<Avatar ring name="AO" />
```

## Do & Don't

### Single

**Do** — One or two initials, sized about 40% of the diameter.

```tsx
<Avatar name="AO" />
```

**Don't** — Cramming in a full set of initials shrinks the type and crowds the circle.

```tsx
<View className="shrink-0 items-center justify-center overflow-hidden bg-muted w-10 h-10 rounded-full">
  <Text className="font-medium text-muted-foreground text-[12px]">ABCD</Text>
</View>
```

### Stacked

**Do** — Cap the stack and summarize the rest with a +N count.

```tsx
<View className="flex-row items-center">
  <Avatar small ring name="AO" />
  <Avatar small ring name="RC" className="-ml-2.5" />
  <Avatar small ring name="LB" className="-ml-2.5" />
  <Avatar small ring name="KT" className="-ml-2.5" />
  <Text className="ml-1.5 text-xs text-muted-foreground">+12</Text>
</View>
```

**Don't** — An unbounded stack runs off the row and stops being scannable.

```tsx
<View className="flex-row items-center">
  <Avatar small ring name="AO" />
  <Avatar small ring name="RC" className="-ml-2.5" />
  <Avatar small ring name="LB" className="-ml-2.5" />
  <Avatar small ring name="KT" className="-ml-2.5" />
  <Avatar small ring name="JD" className="-ml-2.5" />
  <Avatar small ring name="MA" className="-ml-2.5" />
  <Avatar small ring name="AL" className="-ml-2.5" />
  <Avatar small ring name="SK" className="-ml-2.5" />
</View>
```

### Topbar account menu

**Do** — Pair it with the account name and a chevron so it reads as a trigger.

```tsx
<View className="flex-row items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5">
  <Avatar small src="/marcus-allen.jpg" name="MA" />
  <Text className="text-sm font-medium text-foreground">admin@example.com</Text>
  <Icon chevronDown muted size={12} />
</View>
```

**Don't** — A lone avatar gives no hint that it opens the account menu.

```tsx
<Avatar small src="/marcus-allen.jpg" name="MA" />
```

### Identity

**Do** — Name primary; email muted and secondary.

```tsx
<View className="flex-row items-center gap-4">
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text className="text-base font-semibold text-foreground">Rachel Chen</Text>
    <Text className="text-sm text-muted-foreground">rachel.chen@example.com</Text>
  </View>
</View>
```

**Don't** — Equal weight on the name and email flattens the hierarchy.

```tsx
<View className="flex-row items-center gap-4">
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text className="text-sm text-foreground">Rachel Chen</Text>
    <Text className="text-sm text-foreground">rachel.chen@example.com</Text>
  </View>
</View>
```

### Menu header

**Do** — Keep one consistent circular avatar shape across contexts.

```tsx
<View className="flex-row items-center gap-3">
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text className="text-sm font-semibold text-foreground">Ada Lovelace</Text>
    <Text className="text-xs text-muted-foreground">admin@example.com</Text>
  </View>
</View>
```

**Don't** — Squaring the avatar here clashes with the circular avatars everywhere else.

```tsx
<View className="flex-row items-center gap-3">
  <Avatar rounded src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text className="text-sm font-semibold text-foreground">Ada Lovelace</Text>
    <Text className="text-xs text-muted-foreground">admin@example.com</Text>
  </View>
</View>
```
