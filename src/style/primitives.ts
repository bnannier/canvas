// Raw React Native primitives, re-exported so components import their building
// blocks from one place alongside the theme/style helpers. These are RN's own
// View/Text/Pressable/etc. with NO className layer: components style them with
// plain RN style objects built from tokens. Pressable's `style` accepts the
// `({ pressed }) => ...` callback form for press feedback, so no wrapper is
// needed for the old `active:` variant.

export {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  type ViewProps,
  type TextProps,
  type PressableProps,
  type PressableStateCallbackType,
  type ImageProps,
  type TextInputProps,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native";
