# Image

Displays a local or remote image. Set the `source` (`{ uri }`) and a size, and control fitting with `resizeMode` (cover, contain, stretch, center). Remote images load over the network; bundle local assets with `require`.

## Usage

```tsx
<Image
  source={{ uri: "/kira-tanaka.jpg" }}
  style={{ width: 120, height: 120, borderRadius: 12 }}
/>
```

## Variants

### resizeMode - contain

```tsx
<Image
  source={{ uri: "/liang-bao.jpg" }}
  resizeMode="contain"
  style={{ width: 160, height: 120, borderRadius: 12, backgroundColor: tokens.muted }}
/>
```

### Rounded (avatar)

```tsx
<Image
  source={{ uri: "/ada-lovelace.jpg" }}
  style={{ width: 80, height: 80, borderRadius: 40 }}
/>
```
