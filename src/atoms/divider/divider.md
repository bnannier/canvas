# Dividers

Horizontal, vertical, with label, with action.

## Usage

```tsx
<Divider />
```

## Variants

### Orientation - vertical

```tsx
<Divider vertical />
```

### Variant - label

```tsx
<Divider>Or continue with</Divider>
```

### Variant - action

```tsx
<View style={{ width: 320 }}>
  <View style={{ gap: 8 }}>
    <View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Ada commented on the draft</Text>
    </View>
    <View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Grace approved the request</Text>
    </View>
  </View>
  <Divider style={{ marginTop: 12 }} children={<Button ghost small>Show more</Button>} />
</View>
```

## Do & Don't

### Plain

**Do** — Click a row: group with spacing and reserve a divider for a real break like Sign out.

```tsx
<View style={{ maxWidth: 280 }}>
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Profile</Text>
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Account</Text>
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Notifications</Text>
  <Divider style={{ marginVertical: 4 }} />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Sign out</Text>
</View>
```

**Don't** — Click a row: a divider between every one is noise that competes with the content.

```tsx
<View style={{ maxWidth: 280 }}>
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Profile</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Account</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Notifications</Text>
  <Divider />
  <Text style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, lineHeight: 20 }}>Billing</Text>
</View>
```

### With label

**Do** — Click a provider: keep the label to a few words and let the buttons carry the options.

```tsx
<View style={{ width: 320, flexDirection: "column", gap: 8 }}>
  <Button primary block>Sign in</Button>
  <Divider>or continue with</Divider>
  <View style={{ flexDirection: "row", gap: 8 }}>
    <Button outline block style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>Google</Button>
    <Button outline block style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>GitHub</Button>
  </View>
</View>
```

**Don't** — Click Sign in: a full sentence in the label divider buries the choice.

```tsx
<View style={{ width: 320, flexDirection: "column", gap: 8 }}>
  <Button primary block>Sign in</Button>
  <Divider>or continue with one of your previously linked third-party accounts</Divider>
</View>
```

### With action

**Do** — Click Show more: the button toggles its label and reveals the rest.

```tsx
<View style={{ width: 320, gap: 6 }}>
  <Text style={{ paddingVertical: 6, fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Logged in from 2 new devices · 3 more entries</Text>
  <Divider>
    <Button ghost small>Show less</Button>
  </Divider>
</View>
```

**Don't** — Click the button: an action divider that does nothing is just decoration.

```tsx
<View style={{ width: 320 }}>
  <Divider>
    <Button ghost small>Show more</Button>
  </Divider>
</View>
```

### Vertical

**Do** — Click an action: the vertical rule separates inline actions in a row.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Edit</Text>
  <Divider vertical style={{ height: 16 }} />
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Delete</Text>
  <Divider vertical style={{ height: 16 }} />
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Share</Text>
</View>
```

**Don't** — Click an action: a vertical rule between stacked items reads as a glitch.

```tsx
<View style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Edit</Text>
  <Divider vertical style={{ height: 16 }} />
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Delete</Text>
</View>
```
