// Raw React Native primitives, re-exported so components import their building
// blocks from one place alongside the theme/style helpers. These are RN's own
// View/Text/Pressable/etc. with NO className layer: components style them with
// plain RN style objects built from tokens. Pressable's `style` accepts the
// `({ pressed }) => ...` callback form for press feedback, so no wrapper is
// needed for the old `active:` variant.
//
// Image is deliberately absent: it graduated to a Canvas atom (src/atoms/image)
// that wraps RN's Image with boolean fit props (contain/cover/…), so the public
// `Image` is that atom, not the raw primitive. The `ImageStyle` type stays here
// because components (e.g. Avatar) still type their image style objects with it.

export {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  type ViewProps,
  type TextProps,
  type PressableProps,
  type PressableStateCallbackType,
  type TextInputProps,
  type ScrollViewProps,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native";
