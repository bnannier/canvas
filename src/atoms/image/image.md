# Image

Displays a local or remote image. Set the `source` (`{ uri }`) and a size, and control fitting with `resizeMode` (cover, contain, stretch, center). Remote images load over the network; bundle local assets with `require`.

## Usage

```tsx
<Image
  source={{ uri: "https://picsum.photos/seed/canvas/240/160" }}
  style={{ width: 240, height: 160, borderRadius: 12 }}
/>
```

## Variants

### resizeMode - contain

```tsx
<Image
  source={{ uri: "https://picsum.photos/seed/canvas/240/160" }}
  resizeMode="contain"
  style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: tokens.muted }}
/>
```

### Rounded (avatar)

```tsx
<Image
  source={{ uri: "https://picsum.photos/seed/ada/80/80" }}
  style={{ width: 80, height: 80, borderRadius: 40 }}
/>
```
