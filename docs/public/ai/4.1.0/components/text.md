# Text

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/atoms/text/text.md`
Human reference: https://canvas.nannier.com/components/text

## Public imports

```tsx
import { Text } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Renders text. In React Native every string must live inside a Text element, so you cannot put a bare string in a View. For type scale and tone in app code, reach for `<Typography>` (e.g. `<Typography h3>`, `<Typography body>`, `<Typography tiny muted>`), which owns the kit's roles and colors; use the raw Text primitive for the primitive-level cases it does not cover: `numberOfLines` truncation and nested inline runs.

## Usage

```tsx
<Text style={{ color: tokens.foreground }}>The quick brown fox jumps over the lazy dog.</Text>
```

## Variants

### Truncation

```tsx
<Container xxs>
  <Text numberOfLines={1} style={{ color: tokens.foreground }}>
    This single line is clipped with an ellipsis when it overflows its container.
  </Text>
</Container>
```

### Nested runs

```tsx
<Text style={{ color: tokens.foreground }}>
  A run of text can carry an <Text style={{ fontWeight: "700" }}>inline emphasis</Text> that inherits everything else from its parent Text.
</Text>
```

## Do & Don't

### Styled type

**Do** — Reach for `Typography` for any styled type: it owns the kit's roles, sizes, and tones.

```tsx
<Column tight>
  <Typography h3>Heading</Typography>
  <Typography body>Body text</Typography>
  <Typography tiny muted>Muted caption</Typography>
</Column>
```

**Don't** — Hand-styling the raw Text primitive with literal font sizes and weights reinvents the type scale and drifts from the tokens.

```tsx
<View style={{ gap: 4 }}>
  <Text style={{ fontSize: 20, lineHeight: 28, fontWeight: "600", color: tokens.foreground }}>Heading</Text>
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Body text</Text>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Muted caption</Text>
</View>
```

## Supported props

### Text host props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| allowFontScaling | boolean \| undefined | no |  | Specifies whether fonts should scale to respect Text Size accessibility settings. The default is `true`. |
| children | React.ReactNode | no |  |  |
| ellipsizeMode | "middle" \| "head" \| "tail" \| "clip" \| undefined | no |  | This can be one of the following values: - `head` - The line is displayed so that the end fits in the container and the missing text at the beginning of the line is indicated by an ellipsis glyph. e.g., "...wxyz" - `middle` - The line is displayed so that the beginning and end fit in the container and the missing text in the middle is indicated by an ellipsis glyph. "ab...yz" - `tail` - The line is displayed so that the beginning fits in the container and the missing text at the end of the line is indicated by an ellipsis glyph. e.g., "abcd..." - `clip` - Lines are not drawn past the edge of the text container. The default is `tail`. `numberOfLines` must be set in conjunction with this prop. > `clip` is working only for iOS |
| id | string \| undefined | no |  | Used to reference react managed views from native code. |
| lineBreakMode | "middle" \| "head" \| "tail" \| "clip" \| undefined | no |  | Line Break mode. Works only with numberOfLines. clip is working only for iOS |
| numberOfLines | number \| undefined | no |  | Used to truncate the text with an ellipsis after computing the text layout, including line wrapping, such that the total number of lines does not exceed this number. This prop is commonly used with `ellipsizeMode`. |
| onLayout | ((event: LayoutChangeEvent) => void) \| undefined | no |  | Invoked on mount and layout changes with {nativeEvent: { layout: {x, y, width, height}}}. |
| onTextLayout | ((event: TextLayoutEvent) => void) \| undefined | no |  | Invoked on Text layout |
| onPress | ((event: GestureResponderEvent) => void) \| undefined | no |  | This function is called on press. Text intrinsically supports press handling with a default highlight state (which can be disabled with suppressHighlighting). |
| onPressIn | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onPressOut | ((event: GestureResponderEvent) => void) \| undefined | no |  |  |
| onLongPress | ((event: GestureResponderEvent) => void) \| undefined | no |  | This function is called on long press. e.g., `onLongPress={this.increaseSize}>` |
| style | StyleProp<TextStyle> | no |  |  |
| testID | string \| undefined | no |  | Used to locate this view in end-to-end tests. |
| nativeID | string \| undefined | no |  | Used to reference react managed views from native code. |
| maxFontSizeMultiplier | number \| null \| undefined | no |  | Specifies largest possible scale a font can reach when allowFontScaling is enabled. Possible values: - null/undefined (default): inherit from the parent node or the global default (0) - 0: no max, ignore parent/global default - >= 1: sets the maxFontSizeMultiplier of this node to this value |
| minimumFontScale | number \| undefined | no |  | Specifies smallest possible scale a font can reach when adjustsFontSizeToFit is enabled. (values 0.01-1.0). |
| pointerEvents | "box-none" \| "none" \| "box-only" \| "auto" \| undefined | no |  | Controls how touch events are handled. Similar to `View`'s `pointerEvents`. |
| pressRetentionOffset | { top: number; left: number; bottom: number; right: number; } \| undefined | no |  | Defines how far your touch may move off of the button, before deactivating the button. |
| adjustsFontSizeToFit | boolean \| undefined | no |  | Specifies whether font should be scaled down automatically to fit given style constraints. |
| dynamicTypeRamp | "callout" \| "body" \| "caption2" \| "caption1" \| "footnote" \| "subheadline" \| "headline" \| "title3" \| "title2" \| "title1" \| "largeTitle" \| undefined | no |  | The Dynamic Type scale ramp to apply to this element on iOS. |
| suppressHighlighting | boolean \| undefined | no |  | When `true`, no visual change is made when text is pressed down. By default, a gray oval highlights the text on press down. |
| lineBreakStrategyIOS | "none" \| "standard" \| "hangul-word" \| "push-out" \| undefined | no |  | Set line break strategy on iOS. |
| disabled | boolean \| undefined | no |  | Specifies the disabled state of the text view for testing purposes. |
| selectable | boolean \| undefined | no |  | Lets the user select text, to use the native copy and paste functionality. |
| selectionColor | ColorValue \| undefined | no |  | The highlight color of the text. |
| textBreakStrategy | "simple" \| "highQuality" \| "balanced" \| undefined | no |  | Set text break strategy on Android API Level 23+ default is `highQuality`. |
| dataDetectorType | "link" \| "none" \| "all" \| "email" \| "phoneNumber" \| null \| undefined | no |  | Determines the types of data converted to clickable URLs in the text element. By default no data types are detected. |
| android_hyphenationFrequency | "none" \| "normal" \| "full" \| undefined | no |  | Hyphenation strategy |
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
| ref | Ref<Text> \| undefined | no |  | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| key | Key \| null \| undefined | no |  |  |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
