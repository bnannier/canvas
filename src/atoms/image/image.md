# Image

Displays a local or remote image. Set the `source` (`{ uri }`) and a size, then choose how it fills its box with a fit prop: `cover` (the default) fills the box and crops the overflow, while `contain` fits the whole image inside and letterboxes the spare space.

`stretch`, `center`, `repeat`, and `none` cover the rarer fits. `repeat` tiles a bundled asset (or a `{ uri, width, height }` source) at its point size on every platform, drawing the density variant that matches the screen (`grain@2x.png` on a 2x screen) into each tile; a box with no size of its own is one tile. A remote image with no stated size keeps React Native's own repeat. Remote images load over the network; bundle local assets with `require`. Name an image that carries content with `alt`, and it is announced as an image with that name on every platform; an image with no name is decorative, and assistive tech skips it. The v4 hand-off rounds a standalone photo at 12 (`radius="xl"`); Image draws no corner of its own, so a photo inside a Card or a Video keeps its host's corner. For a circular identity photo with an initials fallback, reach for `<Avatar src="…" name="…" />` rather than rounding a bare Image.

## Usage

```tsx
<Image source={{ uri: "/kira-tanaka.jpg" }} alt="Portrait of Kira Tanaka" width={120} height={120} radius="xl" />
```

## Variants

### Contain

```tsx
<Image source={{ uri: "/liang-bao.jpg" }} alt="Portrait of Liang Bao" contain width={160} height={120} radius="xl" />
```

### Cover

```tsx
<Image source={{ uri: "/ada-lovelace.jpg" }} alt="Portrait of Ada Lovelace" cover width={240} height={96} radius="xl" />
```

## Do & Don't

### Fitting a photo

**Do**: Fill a box of another shape with `cover`: the photo keeps its proportions and crops what falls outside the box.

```tsx
<Image source={{ uri: "/grace-hopper.jpg" }} cover width={240} height={96} accessibilityLabel="Grace Hopper" />
```

**Don't**: Stretch a photo to a box of another shape; `stretch` scales each axis on its own, so the picture squashes out of proportion.

```tsx
<Image source={{ uri: "/grace-hopper.jpg" }} stretch width={240} height={96} accessibilityLabel="Grace Hopper" />
```
