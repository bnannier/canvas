# Avatars

A photo when the account has one, falling back to two initials on a brand gradient (seeded admin accounts). Sizes scale font proportionally (40% of diameter).

## Usage

```tsx
<Avatar name="AO" />
```

## Variants

### Variant - stacked

```tsx
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Avatar ring src="/rachel-chen.jpg" name="RC" />
  <Avatar ring src="/liang-bao.jpg" name="LB" style={{ marginLeft: -12 }} />
  <Avatar ring src="/marcus-allen.jpg" name="LB" style={{ marginLeft: -12 }} />
  <Avatar ring src="/kira-tanaka.jpg" name="KT" style={{ marginLeft: -12 }} />
</View>
```

### Variant - topbar

```tsx
<Dropdown items={[
    { label: "Your profile", icon: "👤" },
    { label: "Settings", icon: "⚙" },
    { label: "Sign out", icon: "↩", separatorBefore: true }
  ]}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, paddingVertical: 4, paddingLeft: 4, paddingRight: 10 }}>
    <Avatar small src="/marcus-allen.jpg" name="MA" />
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>admin@example.com</Text>
    <Icon chevronDown muted size={12} />
  </View>
</Dropdown>
```

### Variant - identity

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>rachel.chen@example.com</Text>
  </View>
</View>
```

### Variant - menu

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderColor: tokens.border, paddingBottom: 12 }}>
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Ada Lovelace</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>admin@example.com</Text>
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
<View style={{ flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: tokens.muted, width: 40, height: 40, borderRadius: 9999 }}>
  <Text style={{ fontWeight: "500", color: tokens["muted-foreground"], fontSize: 12 }}>ABCD</Text>
</View>
```

### Stacked

**Do** — Cap the stack and summarize the rest with a +N count.

```tsx
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Avatar small ring name="AO" />
  <Avatar small ring name="RC" style={{ marginLeft: -10 }} />
  <Avatar small ring name="LB" style={{ marginLeft: -10 }} />
  <Avatar small ring name="KT" style={{ marginLeft: -10 }} />
  <Text style={{ marginLeft: 6, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>+12</Text>
</View>
```

**Don't** — An unbounded stack runs off the row and stops being scannable.

```tsx
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Avatar small ring name="AO" />
  <Avatar small ring name="RC" style={{ marginLeft: -10 }} />
  <Avatar small ring name="LB" style={{ marginLeft: -10 }} />
  <Avatar small ring name="KT" style={{ marginLeft: -10 }} />
  <Avatar small ring name="JD" style={{ marginLeft: -10 }} />
  <Avatar small ring name="MA" style={{ marginLeft: -10 }} />
  <Avatar small ring name="AL" style={{ marginLeft: -10 }} />
  <Avatar small ring name="SK" style={{ marginLeft: -10 }} />
</View>
```

### Topbar account menu

**Do** — Pair it with the account name and a chevron so it reads as a trigger.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 9999, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, paddingVertical: 4, paddingLeft: 4, paddingRight: 10 }}>
  <Avatar small src="/marcus-allen.jpg" name="MA" />
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>admin@example.com</Text>
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
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>rachel.chen@example.com</Text>
  </View>
</View>
```

**Don't** — Equal weight on the name and email flattens the hierarchy.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Rachel Chen</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>rachel.chen@example.com</Text>
  </View>
</View>
```

### Menu header

**Do** — Keep one consistent circular avatar shape across contexts.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Ada Lovelace</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>admin@example.com</Text>
  </View>
</View>
```

**Don't** — Squaring the avatar here clashes with the circular avatars everywhere else.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <Avatar rounded src="/ada-lovelace.jpg" name="AL" />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Ada Lovelace</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>admin@example.com</Text>
  </View>
</View>
```
