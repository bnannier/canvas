# Video

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 85d17357eddcab1909bcb59630a0c4a1f1513f08d3a6dcf5378eb84c847dee94

Source: `src/atoms/video/video.md`
Human reference: https://canvas.nannier.com/components/video

## Public imports

```tsx
import { Video } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Plays a clip with an optional poster: tap to play inline, or full transport controls
(the platform's own on iOS and Android, the kit's bar on the web),
with boolean fit, `autoplay`, `loop` and `muted` props.

Give it a `source` (a `{ uri }`, or a bundled asset from `require`), an optional `poster` shown until the clip's first frame is on screen, and the clip's `aspectRatio` (width over height, 16 / 9 by default): the frame fills its parent's width at that ratio and letterboxes the picture on black, inside the v4 hand-off's frame: a 14 px corner on a hairline (`radius` picks a step of the kit's scale instead). Without `controls` it is an inline player: the whole picture is one play and pause control, a play emblem sits over the paused picture, and a spinner shows while the clip loads. With `controls` each platform shows transport its own way:
iOS and Android hand the frame to their own player controls, and the web draws
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

## Supported props

### VideoProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| source | VideoSource | yes |  | The clip: a remote `{ uri }`, or a bundled asset from `require(...)`. |
| poster | ImageSourcePropType \| undefined | no |  | A still shown until the clip's first frame is on screen: a remote `{ uri }` or a bundled asset. |
| contain | boolean \| undefined | no | false | Fit: show the whole picture, letterboxed on black. The default (pick one). |
| cover | boolean \| undefined | no | false | Fit: fill the frame, cropping the overflow (pick one). |
| stretch | boolean \| undefined | no | false | Fit: fill the frame by distorting the aspect ratio (pick one). |
| autoplay | boolean \| undefined | no | false | Start playing as soon as the clip is ready, unless the system asks to reduce motion. Browsers autoplay only muted clips, so pair it with `muted` on the web. |
| loop | boolean \| undefined | no | false | Play again from the start at the end. |
| muted | boolean \| undefined | no | false | Play without sound. |
| controls | boolean \| undefined | no | false | Transport controls: the platform's own player controls on iOS and Android, the kit's control bar on the web. |
| aspectRatio | number \| undefined | no |  | Width over height of the clip; the frame fills its parent's width at this ratio (default 16 / 9). |
| radius | ImageRadius \| undefined | no |  | Corner radius from the kit's radius scale (pick one): none, sm, md, lg, xl, 2xl, 3xl, full. |
| accessibilityLabel | string \| undefined | no |  | The clip's accessible name, used in the names of its controls (default "video"). |
| onPlayingChange | ((playing: boolean) => void) \| undefined | no |  | Called when playback starts or stops. |
| onEnd | (() => void) \| undefined | no |  | Called when the clip plays to its end (each time round, when looping). |
| testID | string \| undefined | no |  | E2E hook forwarded to the frame. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
