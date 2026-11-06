# Breadcrumb

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/atoms/breadcrumb/breadcrumb.md`
Human reference: https://canvas.nannier.com/components/breadcrumb

## Public imports

```tsx
import { Breadcrumb, BreadcrumbItem } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Hierarchical navigation showing where you are.

## Usage

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
```

## Variants

### Slash

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} slash />
```

### Dot

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} dot />
```

### Home icon

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} homeIcon />
```

### Subtle

A page header's quieter trail: the ancestors in the subtle ink and the current page at the
regular weight, so the trail recedes under the title.

```tsx
<Breadcrumb items={["Library", "Controls", "Button"]} slash subtle />
```

## Do & Don't

### Current page

**Do** — Ancestors are links; the page you're on is plain text at the end of the trail.

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — Linking the current page implies there's somewhere to go; it's a dead link to itself.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Projects</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Identity Platform</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Settings</Text>
  </Pressable>
</View>
```

### Deep paths

**Do** — Collapse the middle to an ellipsis; keep the root and the last couple of levels.

```tsx
<Breadcrumb maxItems={3} items={["Projects", "Identity Platform", "Settings", "Avatar", "Edit"]} />
```

**Don't** — A fully expanded deep path wraps and competes with the page.

```tsx
<Breadcrumb items={[
    "Projects",
    "Identity Platform",
    "Settings",
    "Profile",
    "Avatar",
    "Edit"
  ]} />
```

### Separator

**Do** — Pick one separator and use it the whole way.

```tsx
<Breadcrumb items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — Mixing separators in one trail looks broken.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Projects</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Identity Platform</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>›</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
</View>
```

### Home root

**Do** — Give the home icon an aria-label so the root is announced.

```tsx
<Breadcrumb homeIcon items={["Settings"]} />
```

**Don't** — An icon-only root with no label is unclear to screen readers.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Icon home muted size={14} />
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
</View>
```

### Chevron

**Do** — Point the chevron in the reading direction (right in LTR) so each one means 'drill into the next level'.

```tsx
<Breadcrumb chevron items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A down (or back) chevron reads as a dropdown or a back affordance, not progression down the hierarchy.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Projects</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>⌄</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Identity Platform</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>⌄</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
</View>
```

### Slash

**Do** — Keep the slash muted and lighter than the text so it reads as a quiet path divider.

```tsx
<Breadcrumb slash items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A full-weight, foreground slash competes with the labels and can read as part of a link.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Projects</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, paddingHorizontal: 4 }}>/</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Identity Platform</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground, paddingHorizontal: 4 }}>/</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
</View>
```

### Dot

**Do** — Use a centered middot (·) so the dot sits between the crumbs and clearly divides them.

```tsx
<Breadcrumb dot items={["Projects", "Identity Platform", "Settings"]} />
```

**Don't** — A baseline period looks like a typo or end-of-sentence, not a separator between crumbs.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Projects</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>.</Text>
  <Pressable accessibilityRole="link" style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Identity Platform</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>.</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
</View>
```

## Supported props

### BreadcrumbProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | string[] \| undefined | no |  | The trail, ancestor-first. The last entry renders as the current page (plain emphasized text); the rest render as muted links. |
| chevron | boolean \| undefined | no | false | Separator style (pick one; default is the chevron glyph). |
| slash | boolean \| undefined | no | false | Separator style (pick one; default is the chevron glyph). |
| dot | boolean \| undefined | no | false | Separator style (pick one; default is the chevron glyph). |
| homeIcon | boolean \| undefined | no | false | Leading affordance: prepend a muted home-icon crumb (aria-labelled "Home") before the trail, followed by the separator. Off by default. |
| subtle | boolean \| undefined | no | false | A quieter trail for a page header: the ancestors (and the home glyph) in the subtle ink and the current page at the regular weight, so the trail recedes under the title. |
| maxItems | number \| undefined | no |  | Collapse a long trail: when the trail has more than `maxItems` crumbs, keep the first crumb and the last `maxItems - 1` (so `maxItems` crumbs in all), and replace the middle with a single "…" crumb, so a deep path stays on one scannable line. Takes effect from 2. |
| onItemPress | ((item: string, index: number) => void) \| undefined | no |  | Fired with the crumb label and its index when a link (non-last) is pressed. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

### BreadcrumbItemProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  |  |
| current | boolean \| undefined | no | false | Render as the current page: emphasized foreground text, non-interactive. |
| subtle | boolean \| undefined | no | false | The quieter trail's type (see Breadcrumb's `subtle`). |
| onPress | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| style | StyleProp<TextStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
