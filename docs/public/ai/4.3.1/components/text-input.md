# TextInput

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/atoms/text-input/text-input.md`
Human reference: https://canvas.nannier.com/components/text-input

## Public imports

```tsx
import { TextInput } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Single-line (or multiline) text entry. Control it with `value` + `onChangeText`, and style the box with the usual View style props. Common props: `placeholder`, `secureTextEntry` (passwords), `keyboardType`, and `multiline`.

## Usage

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" />
```

## Variants

### Placeholder

```tsx
<TextInput placeholder="Search components..." />
```

### Multiline

```tsx
<TextInput accessibilityLabel="Notes" multiline defaultValue={"Multi-line text\nwraps and grows as you type."} />
```

### Disabled

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} aria-disabled />
```

## Do & Don't

### Labelled fields

**Do**: Reach for `Input` for a form field: its `label` stays in view, names the field for assistive tech, and the field box is drawn for each platform.

```tsx
<Input label="Email" placeholder="ada@example.com" />
```

**Don't**: Let a bare TextInput's placeholder stand in for the label; it vanishes as soon as the user types, taking the field's only name with it.

```tsx
<TextInput placeholder="Email" />
```

### Disabled

**Do**: Pair `editable={false}` with `aria-disabled`. The browser then disables the field and takes it out of the tab order, and VoiceOver and TalkBack announce it as dimmed.

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} aria-disabled />
```

**Don't**: Stop at `editable={false}`. On the web that is only read-only: the field stays a Tab stop and is announced as read-only, not unavailable.

```tsx
<TextInput accessibilityLabel="Plan" defaultValue="Pro" editable={false} />
```

### Focus ring

**Do**: Leave the focus ring to the primitive. It takes the theme's `ring` colour 2 px off the field, like every kit control. The browser draws a text field's ring on every focus, a click included, since the field takes typing however it was focused.

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" />
```

**Don't**: Switch the outline off without painting a focus state of your own. A keyboard user then has no way to see which field takes their typing.

```tsx
<TextInput accessibilityLabel="Your name" defaultValue="Ada Lovelace" style={{ outlineWidth: 0, outlineStyle: "solid" }} />
```

## Supported props

### TextInput host props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| systemFocus | boolean \| undefined | no |  | Keep the platform’s system focus appearance instead of the themed ring. |
| allowFontScaling | boolean \| undefined | no |  | Specifies whether fonts should scale to respect Text Size accessibility settings. The default is `true`. |
| autoCapitalize | "none" \| "sentences" \| "words" \| "characters" \| undefined | no |  | Can tell TextInput to automatically capitalize certain characters. characters: all characters, words: first letter of each word sentences: first letter of each sentence (default) none: don't auto capitalize anything https://reactnative.dev/docs/textinput#autocapitalize |
| autoComplete | "country" \| "name" \| "off" \| "nickname" \| "username" \| "password" \| "2fa-app-otp" \| "additional-name" \| "address-line1" \| "address-line2" \| "birthdate-day" \| "birthdate-full" \| "birthdate-month" \| "birthdate-year" \| "cc-csc" \| "cc-exp" \| "cc-exp-day" \| "cc-exp-month" \| "cc-exp-year" \| "cc-number" \| "cc-name" \| "cc-given-name" \| "cc-middle-name" \| "cc-family-name" \| "cc-type" \| "current-password" \| "email" \| "email-otp" \| "flight-confirmation-code" \| "flight-number" \| "family-name" \| "gender" \| "gift-card-number" \| "gift-card-pin" \| "given-name" \| "honorific-prefix" \| "honorific-suffix" \| "loyalty-account-number" \| "name-family" \| "name-given" \| "name-middle" \| "name-middle-initial" \| "name-prefix" \| "name-suffix" \| "new-password" \| "one-time-code" \| "organization" \| "organization-title" \| "password-new" \| "postal-address" \| "postal-address-country" \| "postal-address-dependent-locality" \| "postal-address-extended" \| "postal-address-extended-postal-code" \| "postal-address-locality" \| "postal-address-region" \| "postal-address-unit" \| "postal-code" \| "promo-code" \| "street-address" \| "sms-otp" \| "tel" \| "tel-country-code" \| "tel-national" \| "tel-device" \| "upi-vpa" \| "url" \| "wifi-password" \| "username-new" \| undefined | no |  | Specifies autocomplete hints for the system, so it can provide autofill. On Android, the system will always attempt to offer autofill by using heuristics to identify the type of content. To disable autocomplete, set autoComplete to off. The following values work across platforms: - `additional-name` - `address-line1` - `address-line2` - `cc-number` - `country` - `current-password` - `email` - `family-name` - `given-name` - `honorific-prefix` - `honorific-suffix` - `name` - `new-password` - `off` - `one-time-code` - `postal-code` - `street-address` - `tel` - `username` The following values work on iOS only: - `nickname` - `organization` - `organization-title` - `url` The following values work on Android only: - `birthdate-day` - `birthdate-full` - `birthdate-month` - `birthdate-year` - `cc-csc` - `cc-exp` - `cc-exp-day` - `cc-exp-month` - `cc-exp-year` - `2fa-app-otp` - `email-otp` - `flight-confirmation-code` - `flight-number` - `gender` - `gift-card-number` - `gift-card-pin` - `loyalty-account-number` - `name-family` - `name-given` - `name-middle` - `name-middle-initial` - `name-prefix` - `name-suffix` - `password` - `password-new` - `postal-address` - `postal-address-country` - `postal-address-dependent-locality` - `postal-address-extended` - `postal-address-extended-postal-code` - `postal-address-locality` - `postal-address-region` - `postal-address-unit` - `promo-code` - `sms-otp` - `tel-country-code` - `tel-national` - `tel-device` - `upi-vpa` - `wifi-password` - `username-new` |
| autoCorrect | boolean \| undefined | no |  | If false, disables auto-correct. The default value is true. |
| autoFocus | boolean \| undefined | no |  | If true, focuses the input on componentDidMount. The default value is false. |
| blurOnSubmit | boolean \| undefined | no |  | If `true`, the text field will blur when submitted. The default value is true for single-line fields and false for multiline fields. Note that for multiline fields, setting `blurOnSubmit` to `true` means that pressing return will blur the field and trigger the `onSubmitEditing` event instead of inserting a newline into the field. |
| submitBehavior | SubmitBehavior \| undefined | no |  | When the return key is pressed, For single line inputs: - `'newline`' defaults to `'blurAndSubmit'` - `undefined` defaults to `'blurAndSubmit'` For multiline inputs: - `'newline'` adds a newline - `undefined` defaults to `'newline'` For both single line and multiline inputs: - `'submit'` will only send a submit event and not blur the input - `'blurAndSubmit`' will both blur the input and send a submit event |
| caretHidden | boolean \| undefined | no |  | If true, caret is hidden. The default value is false. |
| contextMenuHidden | boolean \| undefined | no |  | If true, context menu is hidden. The default value is false. |
| defaultValue | string \| undefined | no |  | Provides an initial value that will change when the user starts typing. Useful for simple use-cases where you don't want to deal with listening to events and updating the value prop to keep the controlled state in sync. |
| editable | boolean \| undefined | no |  | If false, text is not editable. The default value is true. |
| keyboardType | KeyboardTypeOptions \| undefined | no |  | enum("default", 'numeric', 'email-address', "ascii-capable", 'numbers-and-punctuation', 'url', 'number-pad', 'phone-pad', 'name-phone-pad', 'decimal-pad', 'twitter', 'web-search', 'visible-password') Determines which keyboard to open, e.g.numeric. The following values work across platforms: - default - numeric - email-address - phone-pad The following values work on iOS: - ascii-capable - numbers-and-punctuation - url - number-pad - name-phone-pad - decimal-pad - twitter - web-search The following values work on Android: - visible-password |
| inputMode | InputModeOptions \| undefined | no |  | Works like the inputmode attribute in HTML, it determines which keyboard to open, e.g. numeric and has precedence over keyboardType. |
| maxLength | number \| undefined | no |  | Limits the maximum number of characters that can be entered. Use this instead of implementing the logic in JS to avoid flicker. |
| multiline | boolean \| undefined | no |  | If true, the text input can be multiple lines. The default value is false. |
| onBlur | ((e: BlurEvent) => void) \| undefined | no |  | Callback that is called when the text input is blurred Note: If you are trying to find the last value of TextInput, you can use the `onEndEditing` event, which is fired upon completion of editing. |
| onChange | ((e: TextInputChangeEvent) => void) \| undefined | no |  | Callback that is called when the text input's text changes. |
| onChangeText | ((text: string) => void) \| undefined | no |  | Callback that is called when the text input's text changes. Changed text is passed as an argument to the callback handler. |
| onContentSizeChange | ((e: TextInputContentSizeChangeEvent) => void) \| undefined | no |  | Callback that is called when the text input's content size changes. This will be called with `{ nativeEvent: { contentSize: { width, height } } }`. Only called for multiline text inputs. |
| onEndEditing | ((e: TextInputEndEditingEvent) => void) \| undefined | no |  | Callback that is called when text input ends. |
| onPress | ((e: NativeSyntheticEvent<NativeTouchEvent>) => void) \| undefined | no |  | Called when a single tap gesture is detected. |
| onPressIn | ((e: NativeSyntheticEvent<NativeTouchEvent>) => void) \| undefined | no |  | Callback that is called when a touch is engaged. |
| onPressOut | ((e: NativeSyntheticEvent<NativeTouchEvent>) => void) \| undefined | no |  | Callback that is called when a touch is released. |
| onFocus | ((e: FocusEvent) => void) \| undefined | no |  | Callback that is called when the text input is focused |
| onSelectionChange | ((e: TextInputSelectionChangeEvent) => void) \| undefined | no |  | Callback that is called when the text input selection is changed. |
| onSubmitEditing | ((e: TextInputSubmitEditingEvent) => void) \| undefined | no |  | Callback that is called when the text input's submit button is pressed. |
| onScroll | ((e: TextInputScrollEvent) => void) \| undefined | no |  | Invoked on content scroll with `{ nativeEvent: { contentOffset: { x, y } } }`. May also contain other properties from ScrollEvent but on Android contentSize is not provided for performance reasons. |
| onKeyPress | ((e: TextInputKeyPressEvent) => void) \| undefined | no |  | Callback that is called when a key is pressed. This will be called with `{ nativeEvent: { key: keyValue } }` where keyValue is 'Enter' or 'Backspace' for respective keys and the typed-in character otherwise including ' ' for space. Fires before onChange callbacks. Note: on Android only the inputs from soft keyboard are handled, not the hardware keyboard inputs. |
| placeholder | string \| undefined | no |  | The string that will be rendered before text input has been entered |
| placeholderTextColor | ColorValue \| undefined | no |  | The text color of the placeholder string |
| readOnly | boolean \| undefined | no |  | If `true`, text is not editable. The default value is `false`. |
| returnKeyType | ReturnKeyTypeOptions \| undefined | no |  | enum('default', 'go', 'google', 'join', 'next', 'route', 'search', 'send', 'yahoo', 'done', 'emergency-call') Determines how the return key should look. |
| enterKeyHint | EnterKeyHintTypeOptions \| undefined | no |  | Determines what text should be shown to the return key on virtual keyboards. Has precedence over the returnKeyType prop. |
| secureTextEntry | boolean \| undefined | no |  | If true, the text input obscures the text entered so that sensitive text like passwords stay secure. The default value is false. |
| selectTextOnFocus | boolean \| undefined | no |  | If true, all text will automatically be selected on focus |
| selection | { start: number; end?: number \| undefined; } \| undefined | no |  | The start and end of the text input's selection. Set start and end to the same value to position the cursor. |
| selectionColor | ColorValue \| undefined | no |  | The highlight (and cursor on ios) color of the text input |
| style | StyleProp<TextStyle> | no |  | Styles |
| textAlign | "left" \| "right" \| "center" \| undefined | no |  | Align the input text to the left, center, or right sides of the input field. |
| testID | string \| undefined | no |  | Used to locate this view in end-to-end tests |
| inputAccessoryViewID | string \| undefined | no |  | Used to connect to an InputAccessoryView. Not part of react-natives documentation, but present in examples and code. See https://reactnative.dev/docs/inputaccessoryview for more information. |
| inputAccessoryViewButtonLabel | string \| undefined | no |  | An optional label that overrides the default input accessory view button label. |
| value | string \| undefined | no |  | The value to show for the text input. TextInput is a controlled component, which means the native value will be forced to match this value prop if provided. For most uses this works great, but in some cases this may cause flickering - one common cause is preventing edits by keeping value the same. In addition to simply setting the same value, either set editable={false}, or set/update maxLength to prevent unwanted edits without flicker. |
| maxFontSizeMultiplier | number \| null \| undefined | no |  | Specifies largest possible scale a font can reach when allowFontScaling is enabled. Possible values: - null/undefined (default): inherit from the parent node or the global default (0) - 0: no max, ignore parent/global default - >= 1: sets the maxFontSizeMultiplier of this node to this value |
| children | React.ReactNode | no |  |  |
| hitSlop | number \| Insets \| null \| undefined | no |  | This defines how far a touch event can start away from the view. Typical interface guidelines recommend touch targets that are at least 30 - 40 points/density-independent pixels. If a Touchable view has a height of 20 the touchable height can be extended to 40 with hitSlop={{top: 10, bottom: 10, left: 0, right: 0}} NOTE The touch area never extends past the parent view bounds and the Z-index of sibling views always takes precedence if a touch hits two overlapping views. |
| id | string \| undefined | no |  | Used to reference react managed views from native code. |
| needsOffscreenAlphaCompositing | boolean \| undefined | no |  | Whether this view needs to rendered offscreen and composited with an alpha in order to preserve 100% correct colors and blending behavior. The default (false) falls back to drawing the component and its children with an alpha applied to the paint used to draw each element instead of rendering the full component offscreen and compositing it back with an alpha value. This default may be noticeable and undesired in the case where the View you are setting an opacity on has multiple overlapping elements (e.g. multiple overlapping Views, or text and a background). Rendering offscreen to preserve correct alpha behavior is extremely expensive and hard to debug for non-native developers, which is why it is not turned on by default. If you do need to enable this property for an animation, consider combining it with renderToHardwareTextureAndroid if the view contents are static (i.e. it doesn't need to be redrawn each frame). If that property is enabled, this View will be rendered off-screen once, saved in a hardware texture, and then composited onto the screen with an alpha each frame without having to switch rendering targets on the GPU. |
| onLayout | ((event: LayoutChangeEvent) => void) \| undefined | no |  | Invoked on mount and layout changes with {nativeEvent: { layout: {x, y, width, height}}}. |
| pointerEvents | "box-none" \| "none" \| "box-only" \| "auto" \| undefined | no |  |  In the absence of auto property, none is much like CSS's none value. box-none is as if you had applied the CSS class: .box-none { pointer-events: none; } .box-none * { pointer-events: all; } box-only is the equivalent of .box-only { pointer-events: all; } .box-only * { pointer-events: none; } But since pointerEvents does not affect layout/appearance, and we are already deviating from the spec by adding additional modes, we opt to not include pointerEvents on style. On some platforms, we would need to implement it as a className anyways. Using style or not is an implementation detail of the platform. |
| removeClippedSubviews | boolean \| undefined | no |  |  This is a special performance property exposed by RCTView and is useful for scrolling content when there are many subviews, most of which are offscreen. For this property to be effective, it must be applied to a view that contains many subviews that extend outside its bound. The subviews must also have overflow: hidden, as should the containing view (or one of its superviews). |
| nativeID | string \| undefined | no |  | Used to reference react managed views from native code. |
| collapsable | boolean \| undefined | no |  | Views that are only used to layout their children or otherwise don't draw anything may be automatically removed from the native hierarchy as an optimization. Set this property to false to disable this optimization and ensure that this View exists in the native view hierarchy. |
| collapsableChildren | boolean \| undefined | no |  | Setting to false prevents direct children of the view from being removed from the native view hierarchy, similar to the effect of setting `collapsable={false}` on each child. |
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
| disableKeyboardShortcuts | boolean \| undefined | no |  | If true, the keyboard shortcuts (undo/redo and copy buttons) are disabled. The default value is false. |
| clearButtonMode | "always" \| "never" \| "while-editing" \| "unless-editing" \| undefined | no |  | enum('never', 'while-editing', 'unless-editing', 'always') When the clear button should appear on the right side of the text view |
| clearTextOnFocus | boolean \| undefined | no |  | If true, clears the text field automatically when editing begins |
| dataDetectorTypes | DataDetectorTypes \| DataDetectorTypes[] \| undefined | no |  | Determines the types of data converted to clickable URLs in the text input. Only valid if `multiline={true}` and `editable={false}`. By default no data types are detected. You can provide one type or an array of many types. Possible values for `dataDetectorTypes` are: - `'phoneNumber'` - `'link'` - `'address'` - `'calendarEvent'` - `'none'` - `'all'` |
| enablesReturnKeyAutomatically | boolean \| undefined | no |  | If true, the keyboard disables the return key when there is no text and automatically enables it when there is text. The default value is false. |
| keyboardAppearance | "light" \| "dark" \| "default" \| undefined | no |  | Determines the color of the keyboard. |
| passwordRules | string \| null \| undefined | no |  | Provide rules for your password. For example, say you want to require a password with at least eight characters consisting of a mix of uppercase and lowercase letters, at least one number, and at most two consecutive characters. "required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;" |
| rejectResponderTermination | boolean \| null \| undefined | no |  | If `true`, allows TextInput to pass touch events to the parent component. This allows components to be swipeable from the TextInput on iOS, as is the case on Android by default. If `false`, TextInput always asks to handle the input (except when disabled). |
| selectionState | DocumentSelectionState \| undefined | no |  | See DocumentSelectionState.js, some state that is responsible for maintaining selection information for a document |
| spellCheck | boolean \| undefined | no |  | If false, disables spell-check style (i.e. red underlines). The default value is inherited from autoCorrect |
| textContentType | "none" \| "name" \| "URL" \| "addressCity" \| "addressCityAndState" \| "addressState" \| "countryName" \| "creditCardNumber" \| "creditCardExpiration" \| "creditCardExpirationMonth" \| "creditCardExpirationYear" \| "creditCardSecurityCode" \| "creditCardType" \| "creditCardName" \| "creditCardGivenName" \| "creditCardMiddleName" \| "creditCardFamilyName" \| "emailAddress" \| "familyName" \| "fullStreetAddress" \| "givenName" \| "jobTitle" \| "location" \| "middleName" \| "namePrefix" \| "nameSuffix" \| "nickname" \| "organizationName" \| "postalCode" \| "streetAddressLine1" \| "streetAddressLine2" \| "sublocality" \| "telephoneNumber" \| "username" \| "password" \| "newPassword" \| "oneTimeCode" \| "birthdate" \| "birthdateDay" \| "birthdateMonth" \| "birthdateYear" \| "cellularEID" \| "cellularIMEI" \| "dateTime" \| "flightNumber" \| "shipmentTrackingNumber" \| undefined | no |  | Give the keyboard and the system information about the expected semantic meaning for the content that users enter. To disable autofill, set textContentType to `none`. Possible values for `textContentType` are: - `'none'` - `'URL'` - `'addressCity'` - `'addressCityAndState'` - `'addressState'` - `'countryName'` - `'creditCardNumber'` - `'creditCardExpiration'` (iOS 17+) - `'creditCardExpirationMonth'` (iOS 17+) - `'creditCardExpirationYear'` (iOS 17+) - `'creditCardSecurityCode'` (iOS 17+) - `'creditCardType'` (iOS 17+) - `'creditCardName'` (iOS 17+) - `'creditCardGivenName'` (iOS 17+) - `'creditCardMiddleName'` (iOS 17+) - `'creditCardFamilyName'` (iOS 17+) - `'emailAddress'` - `'familyName'` - `'fullStreetAddress'` - `'givenName'` - `'jobTitle'` - `'location'` - `'middleName'` - `'name'` - `'namePrefix'` - `'nameSuffix'` - `'nickname'` - `'organizationName'` - `'postalCode'` - `'streetAddressLine1'` - `'streetAddressLine2'` - `'sublocality'` - `'telephoneNumber'` - `'username'` - `'password'` - `'newPassword'` - `'oneTimeCode'` - `'birthdate'` (iOS 17+) - `'birthdateDay'` (iOS 17+) - `'birthdateMonth'` (iOS 17+) - `'birthdateYear'` (iOS 17+) - `'cellularEID'` (iOS 17.4+) - `'cellularIMEI'` (iOS 17.4+) - `'dateTime'` (iOS 15+) - `'flightNumber'` (iOS 15+) - `'shipmentTrackingNumber'` (iOS 15+) |
| scrollEnabled | boolean \| undefined | no |  | If false, scrolling of the text view will be disabled. The default value is true. Only works with multiline={true} |
| lineBreakStrategyIOS | "none" \| "standard" \| "hangul-word" \| "push-out" \| undefined | no |  | Set line break strategy on iOS. |
| lineBreakModeIOS | "middle" \| "head" \| "tail" \| "clip" \| "wordWrapping" \| "char" \| undefined | no |  | Set line break mode on iOS. |
| smartInsertDelete | boolean \| undefined | no |  | If `false`, the iOS system will not insert an extra space after a paste operation neither delete one or two spaces after a cut or delete operation. The default value is `true`. |
| cursorColor | ColorValue \| null \| undefined | no |  | When provided it will set the color of the cursor (or "caret") in the component. Unlike the behavior of `selectionColor` the cursor color will be set independently from the color of the text selection box. |
| selectionHandleColor | ColorValue \| null \| undefined | no |  | When provided it will set the color of the selection handles when highlighting text. Unlike the behavior of `selectionColor` the handle color will be set independently from the color of the text selection box. |
| importantForAutofill | "auto" \| "yes" \| "no" \| "noExcludeDescendants" \| "yesExcludeDescendants" \| undefined | no |  | Determines whether the individual fields in your app should be included in a view structure for autofill purposes on Android API Level 26+. Defaults to auto. To disable auto complete, use `off`. *Android Only* The following values work on Android only: - `auto` - let Android decide - `no` - not important for autofill - `noExcludeDescendants` - this view and its children aren't important for autofill - `yes` - is important for autofill - `yesExcludeDescendants` - this view is important for autofill but its children aren't |
| disableFullscreenUI | boolean \| undefined | no |  | When false, if there is a small amount of space available around a text input (e.g. landscape orientation on a phone), the OS may choose to have the user edit the text inside of a full screen text input mode. When true, this feature is disabled and users will always edit the text directly inside of the text input. Defaults to false. |
| inlineImageLeft | string \| undefined | no |  | If defined, the provided image resource will be rendered on the left. |
| inlineImagePadding | number \| undefined | no |  | Padding between the inline image, if any, and the text input itself. |
| numberOfLines | number \| undefined | no |  | Sets the number of lines for a TextInput. Use it with multiline set to true to be able to fill the lines. |
| returnKeyLabel | string \| undefined | no |  | Sets the return key to the label. Use it instead of `returnKeyType`. |
| textBreakStrategy | "simple" \| "highQuality" \| "balanced" \| undefined | no |  | Set text break strategy on Android API Level 23+, possible values are simple, highQuality, balanced The default value is simple. |
| underlineColorAndroid | ColorValue \| undefined | no |  | The color of the textInput underline. |
| textAlignVertical | "bottom" \| "top" \| "auto" \| "center" \| undefined | no |  | Vertically align text when `multiline` is set to true |
| showSoftInputOnFocus | boolean \| undefined | no |  | When false, it will prevent the soft keyboard from showing when the field is focused. The default value is true |
| verticalAlign | "bottom" \| "top" \| "auto" \| "middle" \| undefined | no |  | Vertically align text when `multiline` is set to true |
| ref | Ref<TextInput> \| undefined | no |  | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| key | Key \| null \| undefined | no |  |  |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
