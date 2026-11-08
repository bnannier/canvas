# MediaObject

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 1b984bdfad247d053ab7f82ef582b919717b61d8c09c675992bf5d3da2781cec

Source: `src/molecules/media-objects/media-objects.md`
Human reference: https://canvas.nannier.com/components/media-objects

## Public imports

```tsx
import { MediaObject } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.

## Usage

```tsx
<MediaObject
  avatar="RC"
  title="Rachel Chen"
  description="Engineering Lead"
  body="Reviewed the latest pull request and left comments on the auth middleware changes."
  bordered
/>
```

## Variants

### Compact

```tsx
<MediaObject compact avatar="RC" title="Rachel Chen" description="rachel.chen@example.com" />
```

### Bare row with meta

```tsx
<MediaObject avatar="RC" title="Rachel Chen" description="Commented on the deploy pipeline." meta="1h" />
```

### Icon

```tsx
<MediaObject bordered title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
```

### Action

The trailing `action` slot takes any control; the button's `onPress` is yours to
wire.

```tsx
<MediaObject bordered src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada@example.com" action={<Button outline small>Invite</Button>} />
```

### Numbered step

`bareIcon` draws the `icon` node as it is, with no tinted box around it, for a lead that is its own mark: a numbered `<Badge step>` numbers a list of steps.

```tsx
<MediaObject bareIcon icon={<Badge step default>1</Badge>} title="Intrinsic · no JavaScript" description="Fill or hug inside the parent's bounds, a minWidth floor, wrapping." />
```

### Tappable

Passing `onPress` makes the whole row a single tap target; wire it to your own
handler and every tap runs it.

```tsx
<MediaObject onPress={() => {}} bordered avatar="RC" title="Rachel Chen" description="Engineering Lead" />
```

## Do & Don't

### Avatar

**Do** — Top-align with `start` so the avatar anchors to the first line of the title.

```tsx
<MediaObject bordered start src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

**Don't** — Centering the avatar against a multi-line body leaves it floating beside the middle of the text.

```tsx
<MediaObject bordered center src="/rachel-chen.jpg" title="Rachel Chen" description="Engineering Lead" body="Reviewed the latest pull request and left comments on the auth middleware changes. Need to discuss the token rotation approach before merging." />
```

### Icon

**Do** — Keep the lead icon box compact with an 18px glyph so it reads as a tidy lead affordance.

```tsx
<MediaObject bordered start title="Security first" description="End-to-end encryption with automatic key rotation." icon={<Icon shield primary size={18} />} />
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

**Do** — Pass `truncate` so long text clips in place and the trailing action stays pinned right.

```tsx
<MediaObject bordered center truncate src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```

**Don't** — Without truncation a long email wraps and pushes the trailing button out of alignment.

```tsx
<MediaObject bordered center src="/ada-lovelace.jpg" title="Ada Lovelace" description="ada.lovelace@analytical-engine.example.com" action={<Button outline small>Invite</Button>} />
```

## Supported props

### MediaObjectProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | string \| undefined | no |  | Primary line: the bold heading (e.g. a person's name). |
| description | string \| undefined | no |  | Secondary line: muted supporting text under the title (e.g. a role or email). |
| body | ReactNode | no |  | Optional longer body paragraph rendered below the description. |
| meta | string \| undefined | no |  | Trailing metadata text pinned to the right (e.g. "2h ago", "admin"). |
| avatar | string \| undefined | no |  | Initials for the leading avatar (e.g. "RC"); rendered as <Avatar>{avatar}</Avatar>. |
| src | string \| number \| undefined | no |  | Photo for the leading avatar (a URI string or a bundled `require(...)` image); takes precedence over initials. |
| icon | ReactNode | no |  | A leading icon glyph rendered in a tinted square box (stands in for an SVG icon). |
| bareIcon | boolean \| undefined | no | false | Draw the `icon` node as it is, with no tinted box around it: a lead that is its own mark, such as a numbered `<Badge step>` (the Layout page's "try in this order" list). |
| action | ReactNode | no |  | A trailing action node (e.g. a <Button>), pinned to the right edge. |
| onPress | (() => void) \| undefined | no |  | Make the whole row a tappable target (navigate to a detail, select a row). When set, the row renders as a Pressable with a button role and a pressed affordance, so you never hand-roll a Pressable for a tappable media row. |
| center | boolean \| undefined | no | false | Alignment (pick one; default top-aligns with items-start). |
| start | boolean \| undefined | no | false | Alignment (pick one; default top-aligns with items-start). |
| reversed | boolean \| undefined | no | false | Direction (pick one; default leads with the media on the left). |
| leading | boolean \| undefined | no | false | Direction (pick one; default leads with the media on the left). |
| bordered | boolean \| undefined | no | false | Surface. |
| compact | boolean \| undefined | no | false | Menu-header density: a smaller leading avatar (28px) and title/description type stepped down one size, for a compact identity row (e.g. a menu or dropdown header). Backward-compatible; without it the row keeps its default 40px avatar and type. |
| truncate | boolean \| undefined | no | false | Layout. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
