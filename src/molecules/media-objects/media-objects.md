# Media Objects

Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.

## Usage

```tsx
<MediaObject
  avatar="RC"
  title="Rachel Chen"
  description="Engineering Lead"
  body="Reviewed the latest pull request and left comments on the auth middleware changes."
  start
  bordered
/>
```

## Variants

### Tappable

```tsx
<View style={{ maxWidth: 480, gap: 8 }}>
  <MediaObject onPress={() => {}} bordered center avatar="RC" title="Rachel Chen" description="Engineering Lead" meta="admin" truncate />
  <MediaObject onPress={() => {}} bordered center avatar="AL" title="Ada Lovelace" description="Staff Engineer" meta="2h ago" truncate />
</View>
```

### Variant - icon

```tsx
<View style={{ maxWidth: 560, gap: 12 }}>
  <MediaObject bordered start title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
  <MediaObject bordered start title="Real-time analytics" description="Live dashboards with sub-second refresh latency." icon={<Icon activity primary size={18} />} />
</View>
```

### Variant - action

```tsx
<View style={{ maxWidth: 480 }}>
  <MediaObject bordered center truncate src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada@example.com" action={<Button outline small>Invite</Button>} />
</View>
```

## Do & Don't

### Avatar

**Do** — Top-align with items-start so the avatar anchors to the first line of the title.

```tsx
<MediaObject bordered start style={{ maxWidth: 480 }} src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

**Don't** — Centering the avatar against a multi-line body leaves it floating beside the middle of the text.

```tsx
<MediaObject bordered center style={{ maxWidth: 480 }} src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

### Icon

**Do** — Fix the icon box at h-9 w-9 with an 18px glyph so it reads as a tidy lead affordance.

```tsx
<MediaObject bordered start style={{ maxWidth: 480 }} title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
```

**Don't** — An oversized icon box throws off the optical balance with the two-line text.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 16, maxWidth: 480 }}>
  <View style={{ flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15), padding: 8 }}>
    <Icon shield primary size={32} />
  </View>
  <View style={{ minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 2 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Security first</Text>
    <Text style={{ fontSize: 12, lineHeight: 18, color: tokens["muted-foreground"] }}>End-to-end encryption with automatic key rotation.</Text>
  </View>
</View>
```

### Action

**Do** — Use min-w-0 + truncate on the text and shrink-0 on the button to keep the action pinned right.

```tsx
<MediaObject bordered center truncate style={{ maxWidth: 480 }} src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```

**Don't** — Without truncation a long email wraps and pushes the trailing button out of alignment.

```tsx
<MediaObject bordered center style={{ maxWidth: 480 }} src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```
