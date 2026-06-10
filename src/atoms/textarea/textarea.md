# Textareas

Multi-line input, with character count, with toolbar.

## Usage

```tsx
<Textarea rows={4} placeholder="A few words about this project" />
```

## Variants

### Character counter

```tsx
<View style={{ maxWidth: 400 }}>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <Textarea rows={4} placeholder="A few words about this project…" />
  <View style={{ marginTop: 4, flexDirection: "row", justifyContent: "flex-end" }}>
    <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>0 / 280</Text>
  </View>
</View>
```

### Formatting toolbar

```tsx
<View style={{ maxWidth: 400, overflow: "hidden", borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderBottomWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.3), paddingHorizontal: 12, paddingVertical: 8 }}>
    <Button ghost small style={{ minWidth: 32, paddingHorizontal: 8 }}>B</Button>
    <Button ghost small style={{ minWidth: 32, paddingHorizontal: 8 }}>I</Button>
    <Button ghost small style={{ minWidth: 32, paddingHorizontal: 8 }}>{"</>"}</Button>
    <View style={{ marginHorizontal: 4, height: 16, width: 1, backgroundColor: tokens.border }} />
    <Button ghost small style={{ paddingHorizontal: 12 }}>Comment</Button>
  </View>
  <Textarea rows={4} placeholder="Leave a comment…" style={{ minHeight: 104, width: "100%", borderRadius: 0, borderWidth: 0 }} />
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
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <Textarea rows={3} value="This is a longer description that runs past one line and stays readable." />
</View>
```

**Don't** — A locked, single-line textarea hides long content with no way to expand.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <TextInput numberOfLines={1} value="This is a longer description that runs past one line and gets clipped." style={{ height: 32, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14, lineHeight: 20, color: tokens.foreground }} />
</View>
```

### Character counter

**Do** — Show the live count against the cap and turn it destructive past the limit so the overage is precise.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Bio</Text>
  <Textarea rows={3} invalid value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
  <View style={{ marginTop: 4, flexDirection: "row", justifyContent: "flex-end" }}>
    <Text style={{ fontSize: 11, color: tokens.destructive }}>123 / 120</Text>
  </View>
</View>
```

**Don't** — A vague "over limit" message gives no number, so users cannot tell how much to trim.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Bio</Text>
  <Textarea rows={3} value="I have been building things on the web for fifteen years and counting, across teams large and small, shipping product end to end." />
  <View style={{ marginTop: 4, flexDirection: "row", justifyContent: "flex-end" }}>
    <Text style={{ fontSize: 11, color: tokens["muted-foreground"] }}>over limit</Text>
  </View>
</View>
```

### Formatting toolbar

**Do** — Make each control a real focusable button that toggles an active state when pressed.

```tsx
<View style={{ maxWidth: 400, overflow: "hidden", borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderBottomWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.3), paddingHorizontal: 12, paddingVertical: 8 }}>
    <Button ghost small style={{ fontWeight: "700" }}>B</Button>
    <Button ghost small style={{ fontStyle: "italic" }}>I</Button>
    <Button ghost small style={{ fontFamily: "monospace", fontSize: 11 }}>{"</>"}</Button>
  </View>
  <Textarea rows={4} placeholder="Leave a comment" style={{ borderRadius: 0, borderWidth: 0, ...shadow("none") }} />
</View>
```

**Don't** — Static, unclickable glyphs look like a toolbar but cannot be pressed or focused.

```tsx
<View style={{ maxWidth: 400, overflow: "hidden", borderRadius: 6, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderBottomWidth: 1, borderColor: tokens.border, backgroundColor: alpha(tokens.muted, 0.3), paddingHorizontal: 12, paddingVertical: 8 }}>
    <Text style={{ paddingHorizontal: 8, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>B</Text>
    <Text style={{ paddingHorizontal: 8, fontSize: 14, lineHeight: 20, fontStyle: "italic" }}>I</Text>
    <Text style={{ paddingHorizontal: 8, fontFamily: "monospace", fontSize: 11 }}>{"</>"}</Text>
  </View>
  <Textarea rows={4} placeholder="Leave a comment" style={{ borderRadius: 0, borderWidth: 0, ...shadow("none") }} />
</View>
```

### Disabled

**Do** — Use the disabled attribute so the field blocks editing and focus, matching its dimmed look.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <Textarea rows={3} disabled value="Read-only content the user must not change." />
</View>
```

**Don't** — Dimming a textarea while leaving it editable looks disabled but still accepts input.

```tsx
<View style={{ maxWidth: 400, flexDirection: "column", gap: 6 }}>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Description</Text>
  <TextInput multiline editable textAlignVertical="top" value="Read-only content the user must not change." style={{ minHeight: 80, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, lineHeight: 20, color: tokens.foreground, opacity: 0.5 }} />
</View>
```
