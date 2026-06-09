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

### Variant - icon

```tsx
<View className="max-w-[560px] grid grid-cols-1 gap-3 sm:grid-cols-2">
  <MediaObject bordered start title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
  <MediaObject bordered start title="Real-time analytics" description="Live dashboards with sub-second refresh latency." icon={<Icon activity primary size={18} />} />
</View>
```

### Variant - action

```tsx
<View className="max-w-[480px]">
  <MediaObject bordered center truncate src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada@example.com" action={<Button outline small>Invite</Button>} />
</View>
```

## Do & Don't

### Avatar

**Do** — Top-align with items-start so the avatar anchors to the first line of the title.

```tsx
<MediaObject bordered start className="max-w-[480px]" src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

**Don't** — Centering the avatar against a multi-line body leaves it floating beside the middle of the text.

```tsx
<MediaObject bordered center className="max-w-[480px]" src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

### Icon

**Do** — Fix the icon box at h-9 w-9 with an 18px glyph so it reads as a tidy lead affordance.

```tsx
<MediaObject bordered start className="max-w-[480px]" title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
```

**Don't** — An oversized icon box throws off the optical balance with the two-line text.

```tsx
<View className="flex-row items-start gap-3 rounded-lg border border-border bg-card p-4 max-w-[480px]">
  <View className="shrink-0 items-center justify-center rounded-md bg-primary/15 p-2">
    <Icon shield primary size={32} />
  </View>
  <View className="min-w-0 flex-1 gap-0.5">
    <Text className="text-sm font-semibold text-foreground">Security first</Text>
    <Text className="text-xs leading-snug text-muted-foreground">End-to-end encryption with automatic key rotation.</Text>
  </View>
</View>
```

### Action

**Do** — Use min-w-0 + truncate on the text and shrink-0 on the button to keep the action pinned right.

```tsx
<MediaObject bordered center truncate className="max-w-[480px]" src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```

**Don't** — Without truncation a long email wraps and pushes the trailing button out of alignment.

```tsx
<MediaObject bordered center className="max-w-[480px]" src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```
