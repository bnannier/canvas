# Avatar

A photo when the account has one, falling back to one or two initials on the muted token surface (real Liquid Glass on iOS 26+ under glass surface mode). Sizes scale font proportionally (40% of diameter).

## Usage

```tsx
<Avatar name="AO" />
```

## Variants

### Variant - stacked

```tsx
<AvatarGroup small max={4}>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <Avatar src="/liang-bao.jpg" name="LB" />
  <Avatar src="/marcus-allen.jpg" name="MA" />
  <Avatar src="/kira-tanaka.jpg" name="KT" />
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <Avatar src="/grace-hopper.jpg" name="GH" />
  <Avatar src="/noor-park.jpg" name="NP" />
</AvatarGroup>
```

### Variant - topbar

A lone avatar as the account trigger: on iOS the circle is interactive Liquid Glass, so it reads as a control and tapping it opens the account menu, no email or chevron needed.

```tsx
<Dropdown items={[
    { label: "Your profile", icon: "user" },
    { label: "Settings", icon: "settings" },
    { label: "Sign out", icon: "logOut", separatorBefore: true }
  ]}>
  <Avatar small name="MA" />
</Dropdown>
```

### Photo

```tsx
<Avatar src="/rachel-chen.jpg" name="RC" />
```

### Sizes

```tsx
<Row relaxed alignCenter>
  <Avatar small src="/ada-lovelace.jpg" name="AL" />
  <Avatar src="/marcus-allen.jpg" name="MA" />
  <Avatar large src="/rachel-chen.jpg" name="RC" />
</Row>
```

### Rounded

```tsx
<Avatar rounded src="/liang-bao.jpg" name="LB" />
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

**Do** — Cap the stack with `max` and let AvatarGroup summarize the rest as a +N count.

```tsx
<AvatarGroup small max={4} total={16}>
  <Avatar name="AO" />
  <Avatar name="RC" />
  <Avatar name="LB" />
  <Avatar name="KT" />
</AvatarGroup>
```

**Don't** — An unbounded stack (no `max`) runs off the row and stops being scannable.

```tsx
<AvatarGroup small>
  <Avatar name="AO" />
  <Avatar name="RC" />
  <Avatar name="LB" />
  <Avatar name="KT" />
  <Avatar name="JD" />
  <Avatar name="MA" />
  <Avatar name="AL" />
  <Avatar name="SK" />
</AvatarGroup>
```

### Topbar account menu

**Do** — Wrap the trigger in a Dropdown so it opens the account menu. A lone avatar works (on iOS its glass surface reads as an interactive control); pair it with the account name and a chevron when you want the affordance to be explicit everywhere.

```tsx
<Chip outline icon={<Avatar small src="/marcus-allen.jpg" name="MA" />} trailing={<Icon chevronDown muted size={12} />}>admin@example.com</Chip>
```

**Don't** — A bare avatar with no Dropdown around it is decorative, not a trigger, and opens nothing.

```tsx
<Avatar small src="/marcus-allen.jpg" name="MA" />
```

### Identity

**Do** — Name primary; email muted and secondary.

```tsx
<MediaObject center src="/rachel-chen.jpg" title="Rachel Chen" description="rachel.chen@example.com" />
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
<MediaObject compact center src="/ada-lovelace.jpg" title="Ada Lovelace" description="admin@example.com" />
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
