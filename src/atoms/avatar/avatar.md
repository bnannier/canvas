# Avatars

A photo when the account has one, falling back to two initials on a brand gradient (seeded admin accounts). Sizes scale font proportionally (40% of diameter).

## Usage

```tsx
<Avatar name="AO" />
```

## Variants

### Variant - stacked

```tsx
<AvatarGroup max={4}>
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
    { label: "Your profile", icon: "👤" },
    { label: "Settings", icon: "⚙" },
    { label: "Sign out", icon: "↩", separatorBefore: true }
  ]}>
  <Avatar small name="MA" />
</Dropdown>
```

### Variant - topbar with email

```tsx
<Dropdown items={[
    { label: "Your profile", icon: "👤" },
    { label: "Settings", icon: "⚙" },
    { label: "Sign out", icon: "↩", separatorBefore: true }
  ]}>
  <Chip outline icon={<Avatar small src="/marcus-allen.jpg" name="MA" />} trailing={<Icon chevronDown muted size={12} />}>admin@example.com</Chip>
</Dropdown>
```

### Variant - identity

```tsx
<Row relaxed alignCenter>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <Column>
    <Typography lead semibold>Rachel Chen</Typography>
    <Typography small muted>rachel.chen@example.com</Typography>
  </Column>
</Row>
```

### Variant - navigable

An avatar as a link: pass `onPress` and it renders as an accessible button, so tapping it opens a fuller profile. `onPress` is the navigation hook throughout Canvas, so in an app you wire it to your router (`onPress={() => router.push("/team/rachel")}`); here it swaps to the detail card.

```tsx
<Stateful initial={false}>
  {(open, setOpen) =>
    open ? (
      <Card raised>
        <Column relaxed>
          <Row relaxed alignCenter>
            <Avatar large src="/rachel-chen.jpg" name="RC" />
            <Column>
              <Typography lead semibold>Rachel Chen</Typography>
              <Typography small muted>Staff Engineer, Platform</Typography>
            </Column>
          </Row>
          <Typography small muted>rachel.chen@example.com</Typography>
          <Button small outline onPress={() => setOpen(false)}>Back</Button>
        </Column>
      </Card>
    ) : (
      <Row relaxed alignCenter>
        <Avatar src="/rachel-chen.jpg" name="RC" onPress={() => setOpen(true)} />
        <Column>
          <Typography lead semibold>Rachel Chen</Typography>
          <Typography small muted>Open profile</Typography>
        </Column>
      </Row>
    )
  }
</Stateful>
```

### Variant - menu

```tsx
<Column snug>
  <Row cozy alignCenter>
    <Avatar src="/ada-lovelace.jpg" name="AL" />
    <Column>
      <Typography small semibold>Ada Lovelace</Typography>
      <Typography tiny muted>admin@example.com</Typography>
    </Column>
  </Row>
  <Divider />
</Column>
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
<Row relaxed alignCenter>
  <Avatar src="/rachel-chen.jpg" name="RC" />
  <Column>
    <Typography lead semibold>Rachel Chen</Typography>
    <Typography small muted>rachel.chen@example.com</Typography>
  </Column>
</Row>
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
<Row cozy alignCenter>
  <Avatar src="/ada-lovelace.jpg" name="AL" />
  <Column>
    <Typography small semibold>Ada Lovelace</Typography>
    <Typography tiny muted>admin@example.com</Typography>
  </Column>
</Row>
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
