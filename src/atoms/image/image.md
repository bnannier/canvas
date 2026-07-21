# Image

Displays a local or remote image. Set the `source` (`{ uri }`) and a size, and control fitting with `resizeMode` (cover, contain, stretch, center). Remote images load over the network; bundle local assets with `require`. For a circular identity photo with an initials fallback, reach for `<Avatar src="…" name="…" />` rather than rounding a raw Image.

## Usage

```tsx
<Image
  source={{ uri: "/kira-tanaka.jpg" }}
  style={{ width: 120, height: 120, borderRadius: 12 }}
/>
```

## Variants

### Contain

```tsx
<Image
  source={{ uri: "/liang-bao.jpg" }}
  resizeMode="contain"
  style={{ width: 160, height: 120, borderRadius: 12, backgroundColor: tokens.muted }}
/>
```

### Cover

```tsx
<Image
  source={{ uri: "/ada-lovelace.jpg" }}
  resizeMode="cover"
  style={{ width: 240, height: 96, borderRadius: 12 }}
/>
```
