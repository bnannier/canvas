# View

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/atoms/view/view.md`
Human reference: https://canvas.nannier.com/components/view

## Public imports

```tsx
import { View } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The layout primitive: a flex container that
runs identically on iOS, Android, and the web.
A View is a column by default.

Reach for it directly only when no semantic primitive covers what you need: arrangement (direction, gap, alignment, padding) belongs to `Row` and `Column`, which are Views with that axis exposed as boolean props, and a bordered filled surface belongs to `Card`. Numbers are density-independent pixels.

## Usage

```tsx
<View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: tokens.primary }} />
```

## Variants

### Column

```tsx
<Container xs>
  <Column snug>
    <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
    <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
    <View style={{ height: 28, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  </Column>
</Container>
```

### Flex sizing

```tsx
<Container xs>
  <Row snug>
    <View style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
    <View style={{ flex: 2, height: 32, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.3) }} />
  </Row>
</Container>
```

### Padding

```tsx
<View style={{ padding: 16, borderRadius: 10, backgroundColor: alpha(tokens.primary, 0.15) }}>
  <Typography>A padded View</Typography>
</View>
```

## Do & Don't

### Arrangement

**Do** — Row and Column carry direction, gap, alignment and padding as boolean props, so the arrangement reads as language and lands on the kit's spacing scale.

```tsx
<Row cozy alignCenter>
  <Emblem primary><Icon shield /></Emblem>
  <Typography semibold>Semantic arrangement</Typography>
</Row>
```

**Don't** — A hand-written flex style object restates what the primitives already name, drifts off the spacing scale, and has to be re-read to know what it does.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: alpha(tokens.primary, 0.12) }} />
  <Text style={{ color: tokens.foreground, fontWeight: "600" }}>Hand-rolled arrangement</Text>
</View>
```

### Surfaces

**Do** — A bordered, filled, padded surface is a Card; it carries the platform's own radius, hairline and elevation.

```tsx
<Card>
  <Typography>A real surface</Typography>
</Card>
```

**Don't** — Rebuilding the same box out of a View and four style properties drifts from the platform skins the moment one of them changes.

```tsx
<View style={{ width: 240, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card }}>
  <Text style={{ color: tokens.foreground }}>A look-alike surface</Text>
</View>
```

## Supported props

### View host props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | React.ReactNode | no |  |  |
| hitSlop | number \| Insets \| null \| undefined | no |  | This defines how far a touch event can start away from the view. Typical interface guidelines recommend touch targets that are at least 30 - 40 points/density-independent pixels. If a Touchable view has a height of 20 the touchable height can be extended to 40 with hitSlop={{top: 10, bottom: 10, left: 0, right: 0}} NOTE The touch area never extends past the parent view bounds and the Z-index of sibling views always takes precedence if a touch hits two overlapping views. |
| id | string \| undefined | no |  | Used to reference react managed views from native code. |
| needsOffscreenAlphaCompositing | boolean \| undefined | no |  | Whether this view needs to rendered offscreen and composited with an alpha in order to preserve 100% correct colors and blending behavior. The default (false) falls back to drawing the component and its children with an alpha applied to the paint used to draw each element instead of rendering the full component offscreen and compositing it back with an alpha value. This default may be noticeable and undesired in the case where the View you are setting an opacity on has multiple overlapping elements (e.g. multiple overlapping Views, or text and a background). Rendering offscreen to preserve correct alpha behavior is extremely expensive and hard to debug for non-native developers, which is why it is not turned on by default. If you do need to enable this property for an animation, consider combining it with renderToHardwareTextureAndroid if the view contents are static (i.e. it doesn't need to be redrawn each frame). If that property is enabled, this View will be rendered off-screen once, saved in a hardware texture, and then composited onto the screen with an alpha each frame without having to switch rendering targets on the GPU. |
| onLayout | ((event: LayoutChangeEvent) => void) \| undefined | no |  | Invoked on mount and layout changes with {nativeEvent: { layout: {x, y, width, height}}}. |
| pointerEvents | "box-none" \| "none" \| "box-only" \| "auto" \| undefined | no |  |  In the absence of auto property, none is much like CSS's none value. box-none is as if you had applied the CSS class: .box-none { pointer-events: none; } .box-none * { pointer-events: all; } box-only is the equivalent of .box-only { pointer-events: all; } .box-only * { pointer-events: none; } But since pointerEvents does not affect layout/appearance, and we are already deviating from the spec by adding additional modes, we opt to not include pointerEvents on style. On some platforms, we would need to implement it as a className anyways. Using style or not is an implementation detail of the platform. |
| removeClippedSubviews | boolean \| undefined | no |  |  This is a special performance property exposed by RCTView and is useful for scrolling content when there are many subviews, most of which are offscreen. For this property to be effective, it must be applied to a view that contains many subviews that extend outside its bound. The subviews must also have overflow: hidden, as should the containing view (or one of its superviews). |
| style | StyleProp<ViewStyle> | no |  |  |
| testID | string \| undefined | no |  | Used to locate this view in end-to-end tests. |
| nativeID | string \| undefined | no |  | Used to reference react managed views from native code. |
| collapsable | boolean \| undefined | no |  | Views that are only used to layout their children or otherwise don't draw anything may be automatically removed from the native hierarchy as an optimization. Set this property to false to disable this optimization and ensure that this View exists in the native view hierarchy. |
| collapsableChildren | boolean \| undefined | no |  | Setting to false prevents direct children of the view from being removed from the native view hierarchy, similar to the effect of setting `collapsable={false}` on each child. |
| onBlur | ((e: BlurEvent) => void) \| null \| undefined | no |  | Callback that is called when the view is blurred. Note: This will only be called if the view is focusable. |
| onFocus | ((e: FocusEvent) => void) \| null \| undefined | no |  | Callback that is called when the view is focused. Note: This will only be called if the view is focusable. |
| renderToHardwareTextureAndroid | boolean \| undefined | no |  | Whether this view should render itself (and all of its children) into a single hardware texture on the GPU. On Android, this is useful for animations and interactions that only modify opacity, rotation, translation, and/or scale: in those cases, the view doesn't have to be redrawn and display lists don't need to be re-executed. The texture can just be re-used and re-composited with different parameters. The downside is that this can use up limited video memory, so this prop should be set back to false at the end of the interaction/animation. |
| focusable | boolean \| undefined | no |  | Whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard. |
| tabIndex | 0 \| -1 \| undefined | no |  | Indicates whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex for more details. Supports the following values: - 0 (View is focusable) - -1 (View is not focusable) |
| shouldRasterizeIOS | boolean \| undefined | no |  | Whether this view should be rendered as a bitmap before compositing. On iOS, this is useful for animations and interactions that do not modify this component's dimensions nor its children; for example, when translating the position of a static view, rasterization allows the renderer to reuse a cached bitmap of a static view and quickly composite it during each frame. Rasterization incurs an off-screen drawing pass and the bitmap consumes memory. Test and measure when using this property. |
| isTVSelectable | boolean \| undefined | no |  | *(Apple TV only)* When set to true, this view will be focusable and navigable using the Apple TV remote. |
| hasTVPreferredFocus | boolean \| undefined | no |  | *(Apple TV only)* May be set to true to force the Apple TV focus engine to move focus to this view. |
| tvParallaxShiftDistanceX | number \| undefined | no |  | *(Apple TV only)* May be used to change the appearance of the Apple TV parallax effect when this view goes in or out of focus. Defaults to 2.0. |
| tvParallaxShiftDistanceY | number \| undefined | no |  | *(Apple TV only)* May be used to change the appearance of the Apple TV parallax effect when this view goes in or out of focus. Defaults to 2.0. |
| tvParallaxTiltAngle | number \| undefined | no |  | *(Apple TV only)* May be used to change the appearance of the Apple TV parallax effect when this view goes in or out of focus. Defaults to 0.05. |
| tvParallaxMagnification | number \| undefined | no |  | *(Apple TV only)* May be used to change the appearance of the Apple TV parallax effect when this view goes in or out of focus. Defaults to 1.0. |
| onStartShouldSetResponder | ((event: GestureResponderEvent) => boolean) \| undefined | no |  | Does this view want to become responder on the start of a touch? |
| onMoveShouldSetResponder | ((event: GestureResponderEvent) => boolean) \| undefined | no |  | Called for every touch move on the View when it is not the responder: does this view want to "claim" touch responsiveness? |
| onResponderEnd | ((event: GestureResponderEvent) => void) \| undefined | no |  | If the View returns true and attempts to become the responder, one of the following will happen: |
| onResponderGrant | ((event: GestureResponderEvent) => void) \| undefined | no |  | The View is now responding for touch events. This is the time to highlight and show the user what is happening |
| onResponderReject | ((event: GestureResponderEvent) => void) \| undefined | no |  | Something else is the responder right now and will not release it |
| onResponderMove | ((event: GestureResponderEvent) => void) \| undefined | no |  | The user is moving their finger |
| onResponderRelease | ((event: GestureResponderEvent) => void) \| undefined | no |  | Fired at the end of the touch, ie "touchUp" |
| onResponderStart | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onResponderTerminationRequest | ((event: GestureResponderEvent) => boolean) \| undefined | no |  | Something else wants to become responder. Should this view release the responder? Returning true allows release |
| onResponderTerminate | ((event: GestureResponderEvent) => void) \| undefined | no |  | The responder has been taken from the View. Might be taken by other views after a call to onResponderTerminationRequest, or might be taken by the OS without asking (happens with control center/ notification center on iOS) |
| onStartShouldSetResponderCapture | ((event: GestureResponderEvent) => boolean) \| undefined | no |  | onStartShouldSetResponder and onMoveShouldSetResponder are called with a bubbling pattern, where the deepest node is called first. That means that the deepest component will become responder when multiple Views return true for *ShouldSetResponder handlers. This is desirable in most cases, because it makes sure all controls and buttons are usable. However, sometimes a parent will want to make sure that it becomes responder. This can be handled by using the capture phase. Before the responder system bubbles up from the deepest component, it will do a capture phase, firing on*ShouldSetResponderCapture. So if a parent View wants to prevent the child from becoming responder on a touch start, it should have a onStartShouldSetResponderCapture handler which returns true. |
| onMoveShouldSetResponderCapture | ((event: GestureResponderEvent) => boolean) \| undefined | no |  | onStartShouldSetResponder and onMoveShouldSetResponder are called with a bubbling pattern, where the deepest node is called first. That means that the deepest component will become responder when multiple Views return true for *ShouldSetResponder handlers. This is desirable in most cases, because it makes sure all controls and buttons are usable. However, sometimes a parent will want to make sure that it becomes responder. This can be handled by using the capture phase. Before the responder system bubbles up from the deepest component, it will do a capture phase, firing on*ShouldSetResponderCapture. So if a parent View wants to prevent the child from becoming responder on a touch start, it should have a onStartShouldSetResponderCapture handler which returns true. |
| onTouchStart | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onTouchMove | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onTouchEnd | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onTouchCancel | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onTouchEndCapture | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onPointerEnter | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerEnterCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerLeave | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerLeaveCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerMove | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerMoveCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerCancel | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerCancelCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerDown | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerDownCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerUp | ((event: PointerEvent) => void) \| undefined | no |  |  |
| onPointerUpCapture | ((event: PointerEvent) => void) \| undefined | no |  |  |
| accessible | boolean \| undefined | no |  | When true, indicates that the view is an accessibility element. By default, all the touchable elements are accessible. |
| accessibilityActions | readonly Readonly<{ name: AccessibilityActionName \| string; label?: string \| undefined; }>[] \| undefined | no |  | Provides an array of custom actions available for accessibility. |
| accessibilityLabel | string \| undefined | no |  | Overrides the text that's read by the screen reader when the user interacts with the element. By default, the label is constructed by traversing all the children and accumulating all the Text nodes separated by space. |
| aria-label | string \| undefined | no |  | Alias for accessibilityLabel https://reactnative.dev/docs/view#accessibilitylabel https://github.com/facebook/react-native/issues/34424 |
| accessibilityRole | AccessibilityRole \| undefined | no |  | Accessibility Role tells a person using either VoiceOver on iOS or TalkBack on Android the type of element that is focused on. |
| accessibilityState | AccessibilityState \| undefined | no |  | Accessibility State tells a person using either VoiceOver on iOS or TalkBack on Android the state of the element currently focused on. |
| aria-busy | boolean \| undefined | no |  | alias for accessibilityState see https://reactnative.dev/docs/accessibility#accessibilitystate |
| aria-checked | boolean \| "mixed" \| undefined | no |  |  |
| aria-disabled | boolean \| undefined | no |  |  |
| aria-expanded | boolean \| undefined | no |  |  |
| aria-selected | boolean \| undefined | no |  |  |
| accessibilityHint | string \| undefined | no |  | An accessibility hint helps users understand what will happen when they perform an action on the accessibility element when that result is not obvious from the accessibility label. |
| accessibilityValue | AccessibilityValue \| undefined | no |  | Represents the current value of a component. It can be a textual description of a component's value, or for range-based components, such as sliders and progress bars, it contains range information (minimum, current, and maximum). |
| aria-valuemax | number \| undefined | no |  |  |
| aria-valuemin | number \| undefined | no |  |  |
| aria-valuenow | number \| undefined | no |  |  |
| aria-valuetext | string \| undefined | no |  |  |
| onAccessibilityAction | ((event: AccessibilityActionEvent) => void) \| undefined | no |  | When `accessible` is true, the system will try to invoke this function when the user performs an accessibility custom action. |
| importantForAccessibility | "auto" \| "yes" \| "no" \| "no-hide-descendants" \| undefined | no |  | [Android] Controlling if a view fires accessibility events and if it is reported to accessibility services. |
| aria-hidden | boolean \| undefined | no |  | A value indicating whether the accessibility elements contained within this accessibility element are hidden. |
| aria-modal | boolean \| undefined | no |  |  |
| role | Role \| undefined | no |  | Indicates to accessibility services to treat UI component like a specific role. |
| accessibilityLabelledBy | string \| string[] \| undefined | no |  | Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props, the text is read aloud. The value should should match the nativeID of the related element. |
| aria-labelledby | string \| undefined | no |  | Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props, the text is read aloud. The value should should match the nativeID of the related element. |
| accessibilityLiveRegion | "none" \| "polite" \| "assertive" \| undefined | no |  | Indicates to accessibility services whether the user should be notified when this view changes. Works for Android API >= 19 only. |
| aria-live | "polite" \| "assertive" \| "off" \| undefined | no |  | Indicates to accessibility services whether the user should be notified when this view changes. Works for Android API >= 19 only. |
| screenReaderFocusable | boolean \| undefined | no |  | Enables the view to be screen reader focusable, not keyboard focusable. |
| accessibilityElementsHidden | boolean \| undefined | no |  | A Boolean value indicating whether the accessibility elements contained within this accessibility element are hidden to the screen reader. |
| accessibilityViewIsModal | boolean \| undefined | no |  | A Boolean value indicating whether VoiceOver should ignore the elements within views that are siblings of the receiver. |
| onAccessibilityEscape | (() => void) \| undefined | no |  | When accessible is true, the system will invoke this function when the user performs the escape gesture (scrub with two fingers). |
| onAccessibilityTap | (() => void) \| undefined | no |  | When `accessible` is true, the system will try to invoke this function when the user performs accessibility tap gesture. |
| onMagicTap | (() => void) \| undefined | no |  | When accessible is true, the system will invoke this function when the user performs the magic tap gesture. |
| accessibilityIgnoresInvertColors | boolean \| undefined | no |  | https://reactnative.dev/docs/accessibility#accessibilityignoresinvertcolorsios |
| accessibilityLanguage | string \| undefined | no |  | By using the accessibilityLanguage property, the screen reader will understand which language to use while reading the element's label, value and hint. The provided string value must follow the BCP 47 specification (https://www.rfc-editor.org/info/bcp47). https://reactnative.dev/docs/accessibility#accessibilitylanguage-ios |
| accessibilityShowsLargeContentViewer | boolean \| undefined | no |  | A Boolean value that indicates whether or not to show the item in the large content viewer. Available on iOS 13.0+ https://reactnative.dev/docs/accessibility#accessibilityshowslargecontentviewer |
| accessibilityLargeContentTitle | string \| undefined | no |  | When `accessibilityShowsLargeContentViewer` is set, this string will be used as title for the large content viewer. https://reactnative.dev/docs/accessibility#accessibilitylargecontenttitle |
| accessibilityRespondsToUserInteraction | boolean \| undefined | no |  | Blocks the user from interacting with the component through keyboard while still allowing screen reader to interact with it if this View is still accessible. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
