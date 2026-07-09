# Checkboxes

Multi-select option, single yes/no, grouped lists.

## Usage

```tsx
<Row snug alignStart>
  <Checkbox defaultChecked />
  <Column tight>
    <Typography small medium>Email notifications</Typography>
    <Typography tiny muted>Get notified when activity happens on your account.</Typography>
  </Column>
</Row>
```

## Variants

### State - unchecked

```tsx
<Row snug alignStart>
  <Checkbox />
  <Column tight>
    <Typography small medium>Email notifications</Typography>
    <Typography tiny muted>Get notified when activity happens on your account.</Typography>
  </Column>
</Row>
```

### State - disabled

```tsx
<Row snug alignStart>
  <Checkbox disabled />
  <Column tight>
    <Typography small medium>Email notifications</Typography>
    <Typography tiny muted>Get notified when activity happens on your account.</Typography>
  </Column>
</Row>
```

## Do & Don't

### Unchecked

**Do** — Leave opt-in consent unchecked so agreeing is a deliberate act the user takes.

```tsx
<Checkbox>Email me product news, offers, and survey invitations.</Checkbox>
```

**Don't** — A consent box that starts checked opts users in by default; under GDPR pre-ticked consent is not consent.

```tsx
<Checkbox defaultChecked>Email me product news, offers, and survey invitations.</Checkbox>
```

### Checked

**Do** — Show the parent indeterminate (a dash, not a tick) when only some children are checked.

```tsx
<Column snug>
  <Checkbox indeterminate>Select all</Checkbox>
  <Row flush>
    <View style={{ width: 24 }} />
    <Column snug>
      <Checkbox defaultChecked>Read</Checkbox>
      <Checkbox>Write</Checkbox>
      <Checkbox>Delete</Checkbox>
    </Column>
  </Row>
</Column>
```

**Don't** — A fully checked parent claims every child is selected when only one is, so the state reads as a lie.

```tsx
<View style={{ gap: 8 }}>
  <Checkbox defaultChecked>Select all</Checkbox>
  <View style={{ marginLeft: 24, gap: 8 }}>
    <Checkbox defaultChecked>Read</Checkbox>
    <Checkbox>Write</Checkbox>
    <Checkbox>Delete</Checkbox>
  </View>
</View>
```

### Disabled

**Do** — Say why it's unavailable, like a plan gate, or don't show it at all.

```tsx
<Row snug alignCenter>
  <Checkbox disabled>Export to CSV</Checkbox>
  <Typography tiny muted>(Pro plan)</Typography>
</Row>
```

**Don't** — A disabled option with no reason leaves users stuck and guessing.

```tsx
<Checkbox disabled>Export to CSV</Checkbox>
```

### Selection

**Do** — Radios for one-of-many; reserve checkboxes for independent multi-select.

```tsx
<Column snug>
  <Typography small semibold>Plan</Typography>
  <RadioGroup defaultValue="pro">
    <Radio value="free">Free</Radio>
    <Radio value="pro">Pro</Radio>
    <Radio value="enterprise">Enterprise</Radio>
  </RadioGroup>
</Column>
```

**Don't** — Checkboxes allow multiple selections; for a one-of choice they let users pick contradictory options.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ marginBottom: 4, fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Plan</Text>
  <Checkbox>Free</Checkbox>
  <Checkbox defaultChecked>Pro</Checkbox>
  <Checkbox>Enterprise</Checkbox>
</View>
```

### With description

**Do** — Wrap the box, label, and description in a <label> so the whole row toggles.

```tsx
<Checkbox defaultChecked>
  <Typography small medium>Email notifications</Typography>
  <Typography tiny muted>Get notified when activity happens on your account.</Typography>
</Checkbox>
```

**Don't** — A bare div makes only the 16px box clickable; the label text does nothing.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
  <Checkbox defaultChecked />
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Email notifications</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Get notified when activity happens on your account.</Text>
  </View>
</View>
```
