# Divider

Horizontal, vertical, with label, with action.

## Usage

```tsx
<Divider />
```

## Variants

### Orientation - vertical

```tsx
<Row alignCenter cozy>
  <Typography small>Edit</Typography>
  <Divider vertical style={{ height: 16 }} />
  <Typography small>Delete</Typography>
</Row>
```

### Variant - label

```tsx
<Divider>Or continue with</Divider>
```

### Variant - action

```tsx
<Column cozy style={{ width: 320 }}>
  <Column snug>
    <Card padded>
      <Typography small>Ada commented on the draft</Typography>
    </Card>
    <Card padded>
      <Typography small>Grace approved the request</Typography>
    </Card>
  </Column>
  <Divider>
    <Button ghost small>Show more</Button>
  </Divider>
</Column>
```

## Do & Don't

### Plain

**Do** — Click a row: group with spacing and reserve a divider for a real break like Sign out.

```tsx
<Column tight style={{ maxWidth: 280 }}>
  <Typography small>Profile</Typography>
  <Typography small>Account</Typography>
  <Typography small>Notifications</Typography>
  <Divider />
  <Typography small>Sign out</Typography>
</Column>
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
<Column snug style={{ width: 320 }}>
  <Button primary block>Sign in</Button>
  <Divider>or continue with</Divider>
  <Row snug>
    <Column fill>
      <Button outline block>Google</Button>
    </Column>
    <Column fill>
      <Button outline block>GitHub</Button>
    </Column>
  </Row>
</Column>
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
<Column snug style={{ width: 320 }}>
  <Typography small muted>Logged in from 2 new devices · 3 more entries</Typography>
  <Divider>
    <Button ghost small>Show less</Button>
  </Divider>
</Column>
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
<Row alignCenter cozy>
  <Typography small>Edit</Typography>
  <Divider vertical style={{ height: 16 }} />
  <Typography small>Delete</Typography>
  <Divider vertical style={{ height: 16 }} />
  <Typography small>Share</Typography>
</Row>
```

**Don't** — Click an action: a vertical rule between stacked items reads as a glitch.

```tsx
<View style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Edit</Text>
  <Divider vertical style={{ height: 16 }} />
  <Text style={{ fontSize: 14, lineHeight: 20 }}>Delete</Text>
</View>
```
