# Video

Plays a clip with an optional poster: tap to play inline, or full transport controls
<!-- only: web -->
(the platform's own on iOS and Android, the kit's bar on the web),
<!-- /only -->
<!-- only: ios android -->
(the platform's own in a native app, the kit's bar on the web),
<!-- /only -->
with boolean fit, `autoplay`, `loop` and `muted` props.

Give it a `source` (a `{ uri }`, or a bundled asset from `require`), an optional `poster` shown until the clip's first frame is on screen, and the clip's `aspectRatio` (width over height, 16 / 9 by default): the frame fills its parent's width at that ratio and letterboxes the picture on black, inside the v4 hand-off's frame: a 14 px corner on a hairline (`radius` picks a step of the kit's scale instead). Without `controls` it is an inline player: the whole picture is one play and pause control, a play emblem sits over the paused picture, and a spinner shows while the clip loads. With `controls` each platform shows transport its own way:
<!-- only: web -->
iOS and Android hand the frame to their own player controls, and the web draws
<!-- /only -->
<!-- only: ios android -->
a native app hands the frame to the platform's own player controls, and the web draws
<!-- /only -->
the kit's control bar under the picture, with play and pause, the elapsed time, a seek slider, the length, mute, and full screen.

`autoplay` starts a clip once it is ready unless the system asks to reduce motion; browsers autoplay only `muted` clips, and this site's own policy blocks autoplay, so the examples here play on tap. Name every clip with `accessibilityLabel`: its controls are announced as "Play", "Pause", "Seek" and "Mute" followed by that name. Playback runs through the optional `expo-video` peer; without it the frame keeps its size and poster in a labeled frame.

## Usage

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} accessibilityLabel="Sample clip" />
```

## Variants

### Controls

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} controls accessibilityLabel="Sample clip with controls" />
```

### Cover

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} cover aspectRatio={1} accessibilityLabel="Square crop of the sample clip" />
```

### Loop and muted

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} loop muted accessibilityLabel="Looping muted sample clip" />
```

## Do & Don't

### Clips with sound

**Do**: Give a clip people watch with sound `controls`: they can seek, see how long it runs, and mute it.

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} controls accessibilityLabel="Product walkthrough" />
```

**Don't**: Leave a clip with sound as an inline player; a tap can only play or pause it, so there is no way to seek, see its length, or mute it.

```tsx
<Video source={{ uri: "/video-sample.mp4" }} poster={{ uri: "/video-sample.jpg" }} accessibilityLabel="Product walkthrough" />
```
