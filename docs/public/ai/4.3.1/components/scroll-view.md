# ScrollView

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/atoms/scroll-view/scroll-view.md`
Human reference: https://canvas.nannier.com/components/scroll-view

## Public imports

```tsx
import { ScrollView } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A scrollable container for content larger than its bounds: vertical by default, `horizontal` for a row.

Unlike a plain View, a ScrollView lets its children exceed its size and scroll. Style the frame with `style` and the inner content with `contentContainerStyle`. In Chromium and Firefox a scroller with nothing focusable inside it is a keyboard stop of its own, so arrow keys can scroll it; the browser draws its focus ring in the theme's `ring` colour, 2 px off the frame, like every kit control.

## Usage

```tsx
<ScrollView style={{ height: 176, width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 12 }}>
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ height: 36, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
</ScrollView>
```

## Variants

### Horizontal

```tsx
<ScrollView horizontal style={{ width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 12 }}>
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
  <View style={{ width: 200, height: 60, borderRadius: 6, backgroundColor: alpha(tokens.primary, 0.15) }} />
</ScrollView>
```

## Do & Don't

### Bounded height

**Do**: Give the ScrollView a bounded height, its own or its parent's; the content past that edge scrolls inside it.

```tsx
<ScrollView style={{ height: 120, width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 8 }}>
  <Typography small>Deploy started</Typography>
  <Typography small>Dependencies restored from cache</Typography>
  <Typography small>Tests passed</Typography>
  <Typography small>Image pushed to the registry</Typography>
  <Typography small>Rollout reached half the fleet</Typography>
  <Typography small>Rollout complete</Typography>
</ScrollView>
```

**Don't**: Leave the height to the content; an unbounded ScrollView grows to fit all of it, so nothing scrolls and the page grows instead.

```tsx
<ScrollView style={{ width: "100%", borderRadius: 10, borderWidth: 1, borderColor: tokens.border }} contentContainerStyle={{ padding: 12, gap: 8 }}>
  <Typography small>Deploy started</Typography>
  <Typography small>Dependencies restored from cache</Typography>
  <Typography small>Tests passed</Typography>
  <Typography small>Image pushed to the registry</Typography>
  <Typography small>Rollout reached half the fleet</Typography>
  <Typography small>Rollout complete</Typography>
</ScrollView>
```

## Supported props

### ScrollView host props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| contentContainerStyle | StyleProp<ViewStyle> | no |  | These styles will be applied to the scroll view content container which wraps all of the child views. Example: return ( <ScrollView contentContainerStyle={styles.contentContainer}> </ScrollView> ); ... const styles = StyleSheet.create({ contentContainer: { paddingVertical: 20 } }); |
| innerViewRef | React.RefObject<View> \| undefined | no |  | A ref to the inner View element of the ScrollView. This should be used instead of calling `getInnerViewRef`. |
| scrollViewRef | React.RefObject<ScrollView> \| undefined | no |  | A ref to the Native ScrollView component. This ref can be used to call all of ScrollView's public methods, in addition to native methods like measure, measureLayout, etc. |
| decelerationRate | number \| "normal" \| "fast" \| undefined | no |  | A floating-point number that determines how quickly the scroll view decelerates after the user lifts their finger. You may also use string shortcuts `"normal"` and `"fast"` which match the underlying iOS settings for `UIScrollViewDecelerationRateNormal` and `UIScrollViewDecelerationRateFast` respectively. - `'normal'`: 0.998 on iOS, 0.985 on Android (the default) - `'fast'`: 0.99 on iOS, 0.9 on Android |
| horizontal | boolean \| null \| undefined | no |  | When true the scroll view's children are arranged horizontally in a row instead of vertically in a column. The default value is false. |
| invertStickyHeaders | boolean \| undefined | no |  | If sticky headers should stick at the bottom instead of the top of the ScrollView. This is usually used with inverted ScrollViews. |
| keyboardDismissMode | "none" \| "interactive" \| "on-drag" \| undefined | no |  | Determines whether the keyboard gets dismissed in response to a drag. - 'none' (the default) drags do not dismiss the keyboard. - 'onDrag' the keyboard is dismissed when a drag begins. - 'interactive' the keyboard is dismissed interactively with the drag and moves in synchrony with the touch; dragging upwards cancels the dismissal. |
| keyboardShouldPersistTaps | boolean \| "handled" \| "always" \| "never" \| undefined | no |  | Determines when the keyboard should stay visible after a tap. - 'never' (the default), tapping outside of the focused text input when the keyboard is up dismisses the keyboard. When this happens, children won't receive the tap. - 'always', the keyboard will not dismiss automatically, and the scroll view will not catch taps, but children of the scroll view can catch taps. - 'handled', the keyboard will not dismiss automatically when the tap was handled by a children, (or captured by an ancestor). - false, deprecated, use 'never' instead - true, deprecated, use 'always' instead |
| onContentSizeChange | ((contentWidth: number, contentHeight: number) => void) \| undefined | no |  | Called when scrollable content view of the ScrollView changes. Handler function is passed the content width and content height as parameters: (contentWidth, contentHeight) It's implemented using onLayout handler attached to the content container which this ScrollView renders. |
| onScroll | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires at most once per frame during scrolling. |
| onScrollBeginDrag | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires if a user initiates a scroll gesture. |
| onScrollEndDrag | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires when a user has finished scrolling. |
| onMomentumScrollEnd | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires when scroll view has finished moving |
| onMomentumScrollBegin | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires when scroll view has begun moving |
| pagingEnabled | boolean \| undefined | no |  | When true the scroll view stops on multiples of the scroll view's size when scrolling. This can be used for horizontal pagination. The default value is false. |
| scrollEnabled | boolean \| undefined | no |  | When false, the content does not scroll. The default value is true |
| removeClippedSubviews | boolean \| undefined | no |  | Experimental: When true offscreen child views (whose `overflow` value is `hidden`) are removed from their native backing superview when offscreen. This can improve scrolling performance on long lists. The default value is false. |
| showsHorizontalScrollIndicator | boolean \| undefined | no |  | When true, shows a horizontal scroll indicator. |
| showsVerticalScrollIndicator | boolean \| undefined | no |  | When true, shows a vertical scroll indicator. |
| stickyHeaderHiddenOnScroll | boolean \| undefined | no |  | When true, Sticky header is hidden when scrolling down, and dock at the top when scrolling up. |
| style | StyleProp<ViewStyle> | no |  | Style |
| refreshControl | React.ReactElement<RefreshControlProps, string \| React.JSXElementConstructor<any>> \| undefined | no |  | A RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView. |
| snapToInterval | number \| undefined | no |  | When set, causes the scroll view to stop at multiples of the value of `snapToInterval`. This can be used for paginating through children that have lengths smaller than the scroll view. Used in combination with `snapToAlignment` and `decelerationRate="fast"`. Overrides less configurable `pagingEnabled` prop. |
| snapToOffsets | number[] \| undefined | no |  | When set, causes the scroll view to stop at the defined offsets. This can be used for paginating through variously sized children that have lengths smaller than the scroll view. Typically used in combination with `decelerationRate="fast"`. Overrides less configurable `pagingEnabled` and `snapToInterval` props. |
| snapToStart | boolean \| undefined | no |  | Use in conjunction with `snapToOffsets`. By default, the beginning of the list counts as a snap offset. Set `snapToStart` to false to disable this behavior and allow the list to scroll freely between its start and the first `snapToOffsets` offset. The default value is true. |
| snapToEnd | boolean \| undefined | no |  | Use in conjunction with `snapToOffsets`. By default, the end of the list counts as a snap offset. Set `snapToEnd` to false to disable this behavior and allow the list to scroll freely between its end and the last `snapToOffsets` offset. The default value is true. |
| stickyHeaderIndices | number[] \| undefined | no |  | An array of child indices determining which children get docked to the top of the screen when scrolling. For example passing `stickyHeaderIndices={[0]}` will cause the first child to be fixed to the top of the scroll view. This property is not supported in conjunction with `horizontal={true}`. |
| disableIntervalMomentum | boolean \| undefined | no |  | When true, the scroll view stops on the next index (in relation to scroll position at release) regardless of how fast the gesture is. This can be used for horizontal pagination when the page is less than the width of the ScrollView. The default value is false. |
| disableScrollViewPanResponder | boolean \| undefined | no |  | When true, the default JS pan responder on the ScrollView is disabled, and full control over touches inside the ScrollView is left to its child components. This is particularly useful if `snapToInterval` is enabled, since it does not follow typical touch patterns. Do not use this on regular ScrollView use cases without `snapToInterval` as it may cause unexpected touches to occur while scrolling. The default value is false. |
| StickyHeaderComponent | React.ComponentType<any> \| undefined | no |  | A React Component that will be used to render sticky headers, should be used together with stickyHeaderIndices. You may need to set this component if your sticky header uses custom transforms, for example, when you want your list to have an animated and hidable header. If component have not been provided, the default ScrollViewStickyHeader component will be used. |
| children | React.ReactNode | no |  |  |
| hitSlop | number \| Insets \| null \| undefined | no |  | This defines how far a touch event can start away from the view. Typical interface guidelines recommend touch targets that are at least 30 - 40 points/density-independent pixels. If a Touchable view has a height of 20 the touchable height can be extended to 40 with hitSlop={{top: 10, bottom: 10, left: 0, right: 0}} NOTE The touch area never extends past the parent view bounds and the Z-index of sibling views always takes precedence if a touch hits two overlapping views. |
| id | string \| undefined | no |  | Used to reference react managed views from native code. |
| needsOffscreenAlphaCompositing | boolean \| undefined | no |  | Whether this view needs to rendered offscreen and composited with an alpha in order to preserve 100% correct colors and blending behavior. The default (false) falls back to drawing the component and its children with an alpha applied to the paint used to draw each element instead of rendering the full component offscreen and compositing it back with an alpha value. This default may be noticeable and undesired in the case where the View you are setting an opacity on has multiple overlapping elements (e.g. multiple overlapping Views, or text and a background). Rendering offscreen to preserve correct alpha behavior is extremely expensive and hard to debug for non-native developers, which is why it is not turned on by default. If you do need to enable this property for an animation, consider combining it with renderToHardwareTextureAndroid if the view contents are static (i.e. it doesn't need to be redrawn each frame). If that property is enabled, this View will be rendered off-screen once, saved in a hardware texture, and then composited onto the screen with an alpha each frame without having to switch rendering targets on the GPU. |
| onLayout | ((event: LayoutChangeEvent) => void) \| undefined | no |  | Invoked on mount and layout changes with {nativeEvent: { layout: {x, y, width, height}}}. |
| pointerEvents | "box-none" \| "none" \| "box-only" \| "auto" \| undefined | no |  |  In the absence of auto property, none is much like CSS's none value. box-none is as if you had applied the CSS class: .box-none { pointer-events: none; } .box-none * { pointer-events: all; } box-only is the equivalent of .box-only { pointer-events: all; } .box-only * { pointer-events: none; } But since pointerEvents does not affect layout/appearance, and we are already deviating from the spec by adding additional modes, we opt to not include pointerEvents on style. On some platforms, we would need to implement it as a className anyways. Using style or not is an implementation detail of the platform. |
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
| alwaysBounceHorizontal | boolean \| undefined | no |  | When true the scroll view bounces horizontally when it reaches the end even if the content is smaller than the scroll view itself. The default value is true when `horizontal={true}` and false otherwise. |
| alwaysBounceVertical | boolean \| undefined | no |  | When true the scroll view bounces vertically when it reaches the end even if the content is smaller than the scroll view itself. The default value is false when `horizontal={true}` and true otherwise. |
| automaticallyAdjustContentInsets | boolean \| undefined | no |  | Controls whether iOS should automatically adjust the content inset for scroll views that are placed behind a navigation bar or tab bar/ toolbar. The default value is true. |
| automaticallyAdjustKeyboardInsets | boolean \| undefined | no |  | Controls whether the ScrollView should automatically adjust its contentInset and scrollViewInsets when the Keyboard changes its size. The default value is false. |
| automaticallyAdjustsScrollIndicatorInsets | boolean \| undefined | no |  | Controls whether iOS should automatically adjust the scroll indicator insets. The default value is true. Available on iOS 13 and later. |
| bounces | boolean \| undefined | no |  | When true the scroll view bounces when it reaches the end of the content if the content is larger than the scroll view along the axis of the scroll direction. When false it disables all bouncing even if the `alwaysBounce*` props are true. The default value is true. |
| bouncesZoom | boolean \| undefined | no |  | When true gestures can drive zoom past min/max and the zoom will animate to the min/max value at gesture end otherwise the zoom will not exceed the limits. |
| canCancelContentTouches | boolean \| undefined | no |  | When false once tracking starts won't try to drag if the touch moves. The default value is true. |
| centerContent | boolean \| undefined | no |  | When true the scroll view automatically centers the content when the content is smaller than the scroll view bounds; when the content is larger than the scroll view this property has no effect. The default value is false. |
| contentInset | Insets \| undefined | no |  | The amount by which the scroll view content is inset from the edges of the scroll view. Defaults to {0, 0, 0, 0}. |
| contentOffset | PointProp \| undefined | no |  | Used to manually set the starting scroll offset. The default value is {x: 0, y: 0} |
| contentInsetAdjustmentBehavior | "always" \| "never" \| "automatic" \| "scrollableAxes" \| undefined | no |  | This property specifies how the safe area insets are used to modify the content area of the scroll view. The default value of this property is "never". |
| directionalLockEnabled | boolean \| undefined | no |  | When true the ScrollView will try to lock to only vertical or horizontal scrolling while dragging. The default value is false. |
| indicatorStyle | "default" \| "black" \| "white" \| undefined | no |  | The style of the scroll indicators. - default (the default), same as black. - black, scroll indicator is black. This style is good against a white content background. - white, scroll indicator is white. This style is good against a black content background. |
| maintainVisibleContentPosition | { autoscrollToTopThreshold?: number \| null \| undefined; minIndexForVisible: number; } \| null \| undefined | no |  | When set, the scroll view will adjust the scroll position so that the first child that is currently visible and at or beyond minIndexForVisible will not change position. This is useful for lists that are loading content in both directions, e.g. a chat thread, where new messages coming in might otherwise cause the scroll position to jump. A value of 0 is common, but other values such as 1 can be used to skip loading spinners or other content that should not maintain position. The optional autoscrollToTopThreshold can be used to make the content automatically scroll to the top after making the adjustment if the user was within the threshold of the top before the adjustment was made. This is also useful for chat-like applications where you want to see new messages scroll into place, but not if the user has scrolled up a ways and it would be disruptive to scroll a bunch. Caveat 1: Reordering elements in the scrollview with this enabled will probably cause jumpiness and jank. It can be fixed, but there are currently no plans to do so. For now, don't re-order the content of any ScrollViews or Lists that use this feature. Caveat 2: This uses contentOffset and frame.origin in native code to compute visibility. Occlusion, transforms, and other complexity won't be taken into account as to whether content is "visible" or not. |
| maximumZoomScale | number \| undefined | no |  | The maximum allowed zoom scale. The default value is 1.0. |
| minimumZoomScale | number \| undefined | no |  | The minimum allowed zoom scale. The default value is 1.0. |
| onScrollAnimationEnd | (() => void) \| undefined | no |  | Called when a scrolling animation ends. |
| pinchGestureEnabled | boolean \| undefined | no |  | When true, ScrollView allows use of pinch gestures to zoom in and out. The default value is true. |
| scrollEventThrottle | number \| undefined | no |  | Limits how often scroll events will be fired while scrolling, specified as a time interval in ms. This may be useful when expensive work is performed in response to scrolling. Values <= `16` will disable throttling, regardless of the refresh rate of the device. |
| scrollIndicatorInsets | Insets \| undefined | no |  | The amount by which the scroll view indicators are inset from the edges of the scroll view. This should normally be set to the same value as the contentInset. Defaults to {0, 0, 0, 0}. |
| scrollToOverflowEnabled | boolean \| undefined | no |  | When true, the scroll view can be programmatically scrolled beyond its content size. The default value is false. |
| scrollsToTop | boolean \| undefined | no |  | When true the scroll view scrolls to top when the status bar is tapped. The default value is true. |
| snapToAlignment | "start" \| "end" \| "center" \| undefined | no |  | When `snapToInterval` is set, `snapToAlignment` will define the relationship of the snapping to the scroll view. - `start` (the default) will align the snap at the left (horizontal) or top (vertical) - `center` will align the snap in the center - `end` will align the snap at the right (horizontal) or bottom (vertical) |
| onScrollToTop | ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) \| undefined | no |  | Fires when the scroll view scrolls to top after the status bar has been tapped |
| zoomScale | number \| undefined | no |  | The current scale of the scroll view content. The default value is 1.0. |
| endFillColor | ColorValue \| undefined | no |  | Sometimes a scrollview takes up more space than its content fills. When this is the case, this prop will fill the rest of the scrollview with a color to avoid setting a background and creating unnecessary overdraw. This is an advanced optimization that is not needed in the general case. |
| scrollPerfTag | string \| undefined | no |  | Tag used to log scroll performance on this scroll view. Will force momentum events to be turned on (see sendMomentumEvents). This doesn't do anything out of the box and you need to implement a custom native FpsListener for it to be useful. |
| overScrollMode | "auto" \| "always" \| "never" \| undefined | no |  | Used to override default value of overScroll mode. Possible values: - 'auto' - Default value, allow a user to over-scroll this view only if the content is large enough to meaningfully scroll. - 'always' - Always allow a user to over-scroll this view. - 'never' - Never allow a user to over-scroll this view. |
| nestedScrollEnabled | boolean \| undefined | no |  | Enables nested scrolling for Android API level 21+. Nested scrolling is supported by default on iOS. |
| fadingEdgeLength | number \| { start: number; end: number; } \| undefined | no |  | Controls the fading effect at the edges of the scroll content. A value greater than 0 will apply the fading effect, indicating more content is available to scroll. You can specify a single number to apply the same fading length to both edges. Alternatively, use an object with `start` and `end` properties to set different fading lengths for the start and end of the scroll content. The default value is 0. |
| persistentScrollbar | boolean \| undefined | no |  | Causes the scrollbars not to turn transparent when they are not in use. The default value is false. |
| scrollsChildToFocus | boolean \| undefined | no |  | When false, the ScrollView will not automatically scroll to a focused child when the child requests focus. This can be useful when you want to control the scroll position programmatically. The default value is true. |
| ref | Ref<ScrollView> \| undefined | no |  | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| key | Key \| null \| undefined | no |  |  |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
