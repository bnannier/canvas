# Image

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 86ef0dd5d9d38fae6d7bc8bc3fe6497bee4796a18ec156364a14f4fae6008b14

Source: `src/atoms/image/image.md`
Human reference: https://canvas.nannier.com/components/image

## Public imports

```tsx
import { Image } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

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

## Supported props

### ImageProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| source | ImageSourcePropType \| undefined | no |  | The image to display: a remote `{ uri }`, or a bundled asset from `require(...)`. |
| contain | boolean \| undefined | no | false | Fit: fit the whole image inside the box, letterboxing the spare space (pick one). |
| cover | boolean \| undefined | no | false | Fit: fill the box, cropping any overflow. The default when no fit is set (pick one). |
| stretch | boolean \| undefined | no | false | Fit: fill the box by distorting the aspect ratio (pick one). |
| center | boolean \| undefined | no | false | Fit: center at intrinsic size, scaling down only when larger than the box (pick one). |
| repeat | boolean \| undefined | no | false | Fit: tile the image at its intrinsic size to fill the box (pick one). |
| none | boolean \| undefined | no | false | Fit: show at intrinsic size with no scaling (pick one). |
| width | DimensionValue \| undefined | no |  | Width of the image box (px, or a percent string like `"100%"`). Images have no intrinsic layout size. |
| height | DimensionValue \| undefined | no |  | Height of the image box (px, or a percent string). |
| radius | ImageRadius \| undefined | no |  | Corner radius from the kit's radius scale (pick one): none, sm, md, lg, xl, 2xl, 3xl, full. |
| style | StyleProp<ImageStyle> | no |  | Composition only (aspectRatio, layout within a parent). Size comes from `width` / `height`, rounding from `radius`. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the image, the same name `alt` gives (and it wins when both are set). On iOS and Android React Native makes an image its own accessibility element for `alt` (or `accessible`), so prefer `alt` for an image that stands on its own. |
| alt | string \| undefined | no |  | The image's alt text: a named image is announced as an image with this name on every platform (the web's <img alt>, the image role natively). With no name here or in `accessibilityLabel` the image is decorative, and assistive tech skips it. |
| testID | string \| undefined | no |  | E2E hook forwarded to the underlying image. |
| accessible | boolean \| undefined | no | false | When true, indicates that the view is an accessibility element. By default, all the touchable elements are accessible. |
| accessibilityActions | readonly Readonly<{ name: AccessibilityActionName \| string; label?: string \| undefined; }>[] \| undefined | no |  | Provides an array of custom actions available for accessibility. |
| aria-label | string \| undefined | no |  | Alias for accessibilityLabel https://reactnative.dev/docs/view#accessibilitylabel https://github.com/facebook/react-native/issues/34424 |
| blurRadius | number \| undefined | no |  | blurRadius: the blur radius of the blur filter added to the image |
| accessibilityRole | AccessibilityRole \| undefined | no |  | Accessibility Role tells a person using either VoiceOver on iOS or TalkBack on Android the type of element that is focused on. |
| capInsets | Insets \| undefined | no |  | When the image is resized, the corners of the size specified by capInsets will stay a fixed size, but the center content and borders of the image will be stretched. This is useful for creating resizable rounded buttons, shadows, and other resizable assets. More info on Apple documentation |
| accessibilityState | AccessibilityState \| undefined | no |  | Accessibility State tells a person using either VoiceOver on iOS or TalkBack on Android the state of the element currently focused on. |
| onProgress | ((event: ImageProgressEventIOS) => void) \| undefined | no |  | Invoked on download progress with {nativeEvent: {loaded, total}} |
| aria-busy | boolean \| undefined | no | false | alias for accessibilityState see https://reactnative.dev/docs/accessibility#accessibilitystate |
| aria-checked | boolean \| "mixed" \| undefined | no |  |  |
| aria-disabled | boolean \| undefined | no | false |  |
| aria-expanded | boolean \| undefined | no | false |  |
| aria-selected | boolean \| undefined | no | false |  |
| onPartialLoad | (() => void) \| undefined | no |  | Invoked when a partial load of the image is complete. The definition of what constitutes a "partial load" is loader specific though this is meant for progressive JPEG loads. |
| accessibilityHint | string \| undefined | no |  | An accessibility hint helps users understand what will happen when they perform an action on the accessibility element when that result is not obvious from the accessibility label. |
| accessibilityValue | AccessibilityValue \| undefined | no |  | Represents the current value of a component. It can be a textual description of a component's value, or for range-based components, such as sliders and progress bars, it contains range information (minimum, current, and maximum). |
| aria-valuemax | number \| undefined | no |  |  |
| aria-valuemin | number \| undefined | no |  |  |
| aria-valuenow | number \| undefined | no |  |  |
| aria-valuetext | string \| undefined | no |  |  |
| onAccessibilityAction | ((event: AccessibilityActionEvent) => void) \| undefined | no |  | When `accessible` is true, the system will try to invoke this function when the user performs an accessibility custom action. |
| importantForAccessibility | "auto" \| "yes" \| "no" \| "no-hide-descendants" \| undefined | no |  | [Android] Controlling if a view fires accessibility events and if it is reported to accessibility services. |
| resizeMethod | "scale" \| "none" \| "auto" \| "resize" \| undefined | no |  | The mechanism that should be used to resize the image when the image's dimensions differ from the image view's dimensions. Defaults to `auto`. - `auto`: Use heuristics to pick between `resize` and `scale`. - `resize`: A software operation which changes the encoded image in memory before it gets decoded. This should be used instead of `scale` when the image is much larger than the view. - `scale`: The image gets drawn downscaled or upscaled. Compared to `resize`, `scale` is faster (usually hardware accelerated) and produces higher quality images. This should be used if the image is smaller than the view. It should also be used if the image is slightly bigger than the view. - `none`: No sampling is performed and the image is displayed in its full resolution. This should only be used in rare circumstances because it is considered unsafe as Android will throw a runtime exception when trying to render images that consume too much memory. More details about `resize` and `scale` can be found at http://frescolib.org/docs/resizing-rotating.html. |
| aria-hidden | boolean \| undefined | no | false | A value indicating whether the accessibility elements contained within this accessibility element are hidden. |
| aria-modal | boolean \| undefined | no | false |  |
| fadeDuration | number \| undefined | no |  | Duration of fade in animation in ms. Defaults to 300 |
| role | Role \| undefined | no |  | Indicates to accessibility services to treat UI component like a specific role. |
| id | string \| undefined | no |  | Used to reference react managed images from native code. |
| onLayout | ((event: LayoutChangeEvent) => void) \| undefined | no |  | onLayout function Invoked on mount and layout changes with {nativeEvent: { layout: {x, y, width, height} }}. |
| onError | ((error: ImageErrorEvent) => void) \| undefined | no |  | Invoked on load error with {nativeEvent: {error}} |
| onLoad | ((event: ImageLoadEvent) => void) \| undefined | no |  | Invoked when load completes successfully { source: { uri, height, width } }. |
| onLoadEnd | (() => void) \| undefined | no |  | Invoked when load either succeeds or fails |
| onLoadStart | (() => void) \| undefined | no |  | Invoked on load start |
| progressiveRenderingEnabled | boolean \| undefined | no | false |  |
| borderRadius | number \| undefined | no |  |  |
| borderTopLeftRadius | number \| undefined | no |  |  |
| borderTopRightRadius | number \| undefined | no |  |  |
| borderBottomLeftRadius | number \| undefined | no |  |  |
| borderBottomRightRadius | number \| undefined | no |  |  |
| accessibilityLabelledBy | string \| string[] \| undefined | no |  | Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props, the text is read aloud. The value should should match the nativeID of the related element. |
| aria-labelledby | string \| undefined | no |  | Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props, the text is read aloud. The value should should match the nativeID of the related element. |
| accessibilityLiveRegion | "none" \| "polite" \| "assertive" \| undefined | no |  | Indicates to accessibility services whether the user should be notified when this view changes. Works for Android API >= 19 only. |
| src | string \| undefined | no |  | A string representing the resource identifier for the image. Similar to src from HTML. See https://reactnative.dev/docs/image#src |
| srcSet | string \| undefined | no |  | Similar to srcset from HTML. See https://reactnative.dev/docs/image#srcset |
| aria-live | "polite" \| "assertive" \| "off" \| undefined | no |  | Indicates to accessibility services whether the user should be notified when this view changes. Works for Android API >= 19 only. |
| loadingIndicatorSource | ImageURISource \| undefined | no |  | similarly to `source`, this property represents the resource used to render the loading indicator for the image, displayed until image is ready to be displayed, typically after when it got downloaded from network. |
| nativeID | string \| undefined | no |  | Used to reference react managed images from native code. |
| defaultSource | number \| ImageURISource \| undefined | no |  | A static image to display while downloading the final image off the network. |
| screenReaderFocusable | boolean \| undefined | no | false | Enables the view to be screen reader focusable, not keyboard focusable. |
| accessibilityElementsHidden | boolean \| undefined | no | false | A Boolean value indicating whether the accessibility elements contained within this accessibility element are hidden to the screen reader. |
| crossOrigin | "anonymous" \| "use-credentials" \| undefined | no |  | Adds the CORS related header to the request. Similar to crossorigin from HTML. See https://reactnative.dev/docs/image#crossorigin |
| accessibilityViewIsModal | boolean \| undefined | no | false | A Boolean value indicating whether VoiceOver should ignore the elements within views that are siblings of the receiver. |
| tintColor | ColorValue \| undefined | no |  | Changes the color of all the non-transparent pixels to the tintColor. See https://reactnative.dev/docs/image#tintcolor |
| onAccessibilityEscape | (() => void) \| undefined | no |  | When accessible is true, the system will invoke this function when the user performs the escape gesture (scrub with two fingers). |
| referrerPolicy | "origin" \| "no-referrer" \| "no-referrer-when-downgrade" \| "origin-when-cross-origin" \| "same-origin" \| "strict-origin" \| "strict-origin-when-cross-origin" \| "unsafe-url" \| undefined | no |  | A string indicating which referrer to use when fetching the resource. Similar to referrerpolicy from HTML. See https://reactnative.dev/docs/image#referrerpolicy |
| onAccessibilityTap | (() => void) \| undefined | no |  | When `accessible` is true, the system will try to invoke this function when the user performs accessibility tap gesture. |
| onMagicTap | (() => void) \| undefined | no |  | When accessible is true, the system will invoke this function when the user performs the magic tap gesture. |
| accessibilityIgnoresInvertColors | boolean \| undefined | no | false | https://reactnative.dev/docs/accessibility#accessibilityignoresinvertcolorsios |
| accessibilityLanguage | string \| undefined | no |  | By using the accessibilityLanguage property, the screen reader will understand which language to use while reading the element's label, value and hint. The provided string value must follow the BCP 47 specification (https://www.rfc-editor.org/info/bcp47). https://reactnative.dev/docs/accessibility#accessibilitylanguage-ios |
| accessibilityShowsLargeContentViewer | boolean \| undefined | no | false | A Boolean value that indicates whether or not to show the item in the large content viewer. Available on iOS 13.0+ https://reactnative.dev/docs/accessibility#accessibilityshowslargecontentviewer |
| accessibilityLargeContentTitle | string \| undefined | no |  | When `accessibilityShowsLargeContentViewer` is set, this string will be used as title for the large content viewer. https://reactnative.dev/docs/accessibility#accessibilitylargecontenttitle |
| accessibilityRespondsToUserInteraction | boolean \| undefined | no | false | Blocks the user from interacting with the component through keyboard while still allowing screen reader to interact with it if this View is still accessible. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
