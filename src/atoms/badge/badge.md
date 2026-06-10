# Badges

Two families on one Badge component, picked by boolean props. The metadata badge is a rectangular pill for labels like schema, role, or tag (tones: default, secondary, outline, destructive; add `mono` for token names). The status badge (`status`) is a rounded pill with a leading dot for live state like active, pending, or failed (tones: success, warning, error, info, neutral).

## Usage

```tsx
<Badge secondary>admin</Badge>
```

## Variants

### Type - status

```tsx
<Badge status success>admin</Badge>
```

### Type - identity

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Text style={{ fontSize: 15, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
  <Badge status success>active</Badge>
  <Badge status info>Verified</Badge>
  <Badge secondary>employee</Badge>
</View>
```

### Type - grants

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
  <Badge secondary mono>authorization_code</Badge>
  <Badge secondary mono>refresh_token</Badge>
  <Badge secondary mono>client_credentials</Badge>
</View>
```

### Badge variant - default

```tsx
<Badge default>admin</Badge>
```

### Badge variant - outline

```tsx
<Badge outline>admin</Badge>
```

### Badge variant - destructive

```tsx
<Badge destructive>admin</Badge>
```

### Mono (token / event names)

```tsx
<Badge secondary mono>admin</Badge>
```

## Do & Don't

### Metadata badge

**Do** — Neutral tags for metadata; reserve color and the status-badge dot for live state.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
  <Badge status success>active</Badge>
</View>
```

**Don't** — Borrowing status colors for plain metadata reads as severity that isn't there; a red tag looks like an error.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge default>employee</Badge>
  <Badge destructive>engineering</Badge>
  <Badge default>remote</Badge>
  <Badge destructive>active</Badge>
</View>
```

### Status badge

**Do** — Always pair the dot with a word: active, pending, failed.

```tsx
<Badge status error>Failed</Badge>
```

**Don't** — A bare colored dot isn't a label and fails for color-blind users.

```tsx
<Badge status error />
```

### Identity row

**Do** — Show only the one or two badges relevant to this view.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Text style={{ fontSize: 15, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
  <Badge status success>active</Badge>
  <Badge secondary>employee</Badge>
</View>
```

**Don't** — A wall of badges after a name buries the one that matters.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Text style={{ fontSize: 15, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
  <Badge status success>active</Badge>
  <Badge status info>Verified</Badge>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
  <Badge secondary>admin</Badge>
</View>
```

### Token / code badge

**Do** — Use the mono variant for tokens, scopes, and event names.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
  <Badge secondary mono>authorization_code</Badge>
  <Badge secondary mono>refresh_token</Badge>
  <Badge secondary mono>client_credentials</Badge>
</View>
```

**Don't** — Proportional type makes identifiers hard to scan and compare.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
  <Badge secondary>authorization_code</Badge>
  <Badge secondary>refresh_token</Badge>
  <Badge secondary>client_credentials</Badge>
</View>
```

### Default variant

**Do** — Reserve the default fill for the single tag you want noticed first; keep the rest secondary.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge default>admin</Badge>
  <Badge secondary>engineering</Badge>
  <Badge secondary>remote</Badge>
</View>
```

**Don't** — The solid primary fill is the loudest badge; using it for every tag makes the whole row shout and nothing leads.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge default>employee</Badge>
  <Badge default>engineering</Badge>
  <Badge default>remote</Badge>
  <Badge default>admin</Badge>
</View>
```

### Secondary variant

**Do** — Keep secondary for static metadata (role, team) and switch to the status-badge for anything live.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge secondary>employee</Badge>
  <Badge secondary>engineering</Badge>
  <Badge status success>active</Badge>
</View>
```

**Don't** — A muted gray pill reads as static metadata, so live state shown as a secondary badge looks inert and goes unnoticed.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge secondary>active</Badge>
  <Badge secondary>pending</Badge>
  <Badge secondary>failed</Badge>
</View>
```

### Outline variant

**Do** — Use outline on a plain surface where the quiet border has contrast, for low-priority secondary tags.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 12 }}>
  <Badge outline>draft</Badge>
  <Badge outline>internal</Badge>
</View>
```

**Don't** — The thin border is the whole badge; on a colored or busy surface it disappears and the label floats unboxed.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, borderRadius: 6, backgroundColor: tokens.primary, padding: 12 }}>
  <Badge outline>draft</Badge>
  <Badge outline>internal</Badge>
</View>
```

### Destructive variant

**Do** — Reserve destructive for genuinely destructive or error semantics like revoked or banned.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge destructive>Revoked</Badge>
  <Badge destructive>Banned</Badge>
  <Badge secondary>marketing</Badge>
</View>
```

**Don't** — Solid red signals error or danger, so using it to color-code neutral categories raises a false alarm.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Badge destructive>marketing</Badge>
  <Badge destructive>finance</Badge>
  <Badge destructive>legal</Badge>
</View>
```
